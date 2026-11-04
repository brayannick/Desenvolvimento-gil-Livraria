import test from 'node:test';
import assert from 'node:assert/strict';
import { Livro } from '../Livro.js';
import { LivroRepository } from '../LivroRepository.js';

test('mantém as mensagens e a ordem das validações de campos obrigatórios', () => {
  const livro = new Livro(' \t', '', null, undefined);
  assert.deepEqual(livro.validarDados(), [
    'Informe o título.',
    'Informe o autor.',
    'Informe o ISBN.',
    'Informe o ano de publicação.',
  ]);
  const repositorio = new LivroRepository();
  assert.deepEqual(livro.cadastrarLivro(repositorio), {
    sucesso: false,
    mensagem: 'Informe o título. Informe o autor. Informe o ISBN. Informe o ano de publicação.',
  });
  assert.deepEqual(repositorio.listar(), []);
  assert.equal(livro.id, null);
});

for (const ano of [0, -1, 1.5, '2024', Infinity]) {
  test(`mantém a rejeição do ano inválido ${String(ano)}`, () => {
    assert.deepEqual(new Livro('Título', 'Autor', '123', ano).validarDados(), [
      'O ano de publicação deve ser um número inteiro positivo.',
    ]);
  });
}

for (const primeiroIsbn of ['978-85-359-1484-9', '978 85 359 1484 9', '9788535914849']) {
  test(`detecta duplicidade de ISBN normalizando ambos os lados: ${primeiroIsbn}`, () => {
    const repositorio = new LivroRepository();
    const primeiro = new Livro('Título', 'Autor', primeiroIsbn, 2024);
    assert.deepEqual(primeiro.validarDados(), []);
    assert.deepEqual(primeiro.cadastrarLivro(repositorio), {
      sucesso: true,
      mensagem: 'Livro cadastrado com sucesso.',
    });
    assert.equal(primeiro.id, 1);
    assert.equal(primeiro.isbn, primeiroIsbn);

    for (const isbn of ['978-85-359-1484-9', '978 85 359 1484 9', '9788535914849']) {
      const duplicado = new Livro('Outro título', 'Outro autor', isbn, 2025);
      assert.deepEqual(duplicado.cadastrarLivro(repositorio), {
        sucesso: false,
        mensagem: 'Já existe um livro cadastrado com este ISBN.',
      });
      assert.equal(duplicado.id, null);
    }

    assert.equal(repositorio.listar().length, 1);
    const outro = new Livro('Outro título', 'Autor', '9788535914850', 2025);
    assert.equal(outro.cadastrarLivro(repositorio).sucesso, true);
    assert.equal(outro.id, 2);
    assert.equal(repositorio.listar().length, 2);
  });
}
