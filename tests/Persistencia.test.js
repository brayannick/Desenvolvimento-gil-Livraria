import test from 'node:test';
import assert from 'node:assert/strict';
import { Livro } from '../Livro.js';
import { LivroRepository } from '../LivroRepository.js';

function criarArmazenamentoFalso() {
  const dados = {};
  return {
    getItem(chave) {
      return dados[chave] ?? null;
    },
    setItem(chave, valor) {
      dados[chave] = String(valor);
    },
  };
}

test('restaura a lista e continua os IDs após recriar o repositório', () => {
  const armazenamento = criarArmazenamentoFalso();
  const repositorio = new LivroRepository(armazenamento);
  const primeiro = new Livro('Primeiro', 'Autor', '978-85-359-1484-9', 2020);
  assert.equal(primeiro.cadastrarLivro(repositorio).sucesso, true);
  assert.deepEqual(JSON.parse(armazenamento.getItem('biblioteca.livros')), {
    livros: [{ ...primeiro }],
    proximoId: 2,
  });

  const restaurado = new LivroRepository(armazenamento);
  assert.deepEqual(restaurado.listar(), [{ ...primeiro }]);
  const duplicado = new Livro('Duplicado', 'Autor', '978 85 359 1484 9', 2021);
  assert.equal(duplicado.cadastrarLivro(restaurado).sucesso, false);
  assert.equal(duplicado.id, null);

  const segundo = new Livro('Segundo', 'Autor', 'outro-isbn', 2022);
  assert.equal(segundo.cadastrarLivro(restaurado).sucesso, true);
  assert.equal(segundo.id, 2);

  const recarregado = new LivroRepository(armazenamento);
  assert.deepEqual(recarregado.listar(), [{ ...primeiro }, { ...segundo }]);
  const terceiro = new Livro('Terceiro', 'Autor', 'terceiro-isbn', 2023);
  recarregado.salvar(terceiro);
  assert.equal(terceiro.id, 3);
});

test('restaura o contador persistido em vez de usar o tamanho da lista', () => {
  const armazenamento = criarArmazenamentoFalso();
  armazenamento.setItem('biblioteca.livros', JSON.stringify({ livros: [], proximoId: 8 }));
  const livro = new Livro('Título', 'Autor', '123', 2024);
  new LivroRepository(armazenamento).salvar(livro);
  assert.equal(livro.id, 8);
});

test('o armazenamento padrão funciona no Node e isola cada repositório', () => {
  const primeiro = new LivroRepository();
  const segundo = new LivroRepository();
  primeiro.salvar(new Livro('Título', 'Autor', '123', 2024));
  assert.equal(primeiro.listar().length, 1);
  assert.deepEqual(segundo.listar(), []);
});

test('uma falha ao gravar não altera a lista nem consome um ID', () => {
  const armazenamento = criarArmazenamentoFalso();
  const gravar = armazenamento.setItem;
  armazenamento.setItem = () => { throw new Error('Armazenamento indisponível'); };
  const repositorio = new LivroRepository(armazenamento);
  const livro = new Livro('Título', 'Autor', '123', 2024);
  assert.throws(() => repositorio.salvar(livro), /Armazenamento indisponível/);
  assert.equal(livro.id, null);
  assert.deepEqual(repositorio.listar(), []);

  armazenamento.setItem = gravar;
  repositorio.salvar(livro);
  assert.equal(livro.id, 1);
});
