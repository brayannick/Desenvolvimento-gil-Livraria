import test from 'node:test';
import assert from 'node:assert/strict';
import { Livro } from '../js/Livro.js';
import { LivroRepository } from '../js/LivroRepository.js';

// Simula o localStorage; o mesmo objeto representa o navegador entre "recarregamentos".
function criarStorage(inicial = {}) {
  const dados = new Map(Object.entries(inicial));
  return {
    dados,
    getItem: (chave) => (dados.has(chave) ? dados.get(chave) : null),
    setItem: (chave, valor) => dados.set(chave, String(valor)),
  };
}

test('grava no storage em formato JSON', () => {
  const storage = criarStorage();
  new Livro('Dom Casmurro', 'Machado de Assis', '9788535914849', 1899).cadastrarLivro(
    new LivroRepository(storage)
  );

  assert.deepEqual(JSON.parse(storage.dados.get('biblioteca:livros')), [
    {
      id: 1,
      titulo: 'Dom Casmurro',
      autor: 'Machado de Assis',
      isbn: '9788535914849',
      anoPublicacao: 1899,
    },
  ]);
});

test('os livros continuam salvos após recarregar a página (novo repositório)', () => {
  const storage = criarStorage();
  new Livro('Livro A', 'Autor A', '111', 2000).cadastrarLivro(new LivroRepository(storage));
  new Livro('Livro B', 'Autor B', '222', 2001).cadastrarLivro(new LivroRepository(storage));

  const aposRecarregar = new LivroRepository(storage);
  assert.deepEqual(
    aposRecarregar.listar().map((livro) => [livro.id, livro.titulo]),
    [[1, 'Livro A'], [2, 'Livro B']]
  );
  assert.equal(aposRecarregar.existeIsbn('111'), true);
});

test('ISBN duplicado é detectado mesmo depois de recarregar', () => {
  const storage = criarStorage();
  new Livro('Livro A', 'Autor A', '978-85-359-1484-9', 2000).cadastrarLivro(
    new LivroRepository(storage)
  );

  const duplicado = new Livro('Livro B', 'Autor B', '9788535914849', 2001);
  const resultado = duplicado.cadastrarLivro(new LivroRepository(storage));
  assert.equal(resultado.sucesso, false);
  assert.equal(new LivroRepository(storage).listar().length, 1);
});

test('o id continua crescendo após recarregar, sem repetir', () => {
  const storage = criarStorage();
  new Livro('Livro A', 'Autor A', '111', 2000).cadastrarLivro(new LivroRepository(storage));

  const novo = new Livro('Livro B', 'Autor B', '222', 2001);
  novo.cadastrarLivro(new LivroRepository(storage));
  assert.equal(novo.id, 2);
});

test('dados corrompidos no storage são tratados como lista vazia', () => {
  for (const valor of ['{quebrado', '"texto"', '{"a":1}', 'null']) {
    const repositorio = new LivroRepository(criarStorage({ 'biblioteca:livros': valor }));
    assert.deepEqual(repositorio.listar(), []);
    assert.equal(new Livro('A', 'B', '1', 2000).cadastrarLivro(repositorio).sucesso, true);
  }
});

test('sem localStorage disponível, usa memória e continua funcionando', () => {
  const repositorio = new LivroRepository();
  const livro = new Livro('Livro A', 'Autor A', '111', 2000);
  assert.equal(livro.cadastrarLivro(repositorio).sucesso, true);
  assert.equal(repositorio.listar().length, 1);
});
