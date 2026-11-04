import test from 'node:test';
import assert from 'node:assert/strict';
import { Livro } from '../Livro.js';

test('livro válido mantém os atributos e começa sem identificador', () => {
  const livro = new Livro('Dom Casmurro', 'Machado de Assis', '9788535914849', 1899);

  assert.equal(livro.id, null);
  assert.equal(livro.titulo, 'Dom Casmurro');
  assert.equal(livro.autor, 'Machado de Assis');
  assert.equal(livro.isbn, '9788535914849');
  assert.equal(livro.anoPublicacao, 1899);
  assert.deepEqual(livro.validarDados(), []);
});

for (const indice of [0, 1, 2]) {
  for (const valor of ['', '   ', '\t\n', null, undefined]) {
    test(`rejeita campo obrigatório ${indice} com valor ${JSON.stringify(valor)}`, () => {
      const dados = ['Dom Casmurro', 'Machado de Assis', '9788535914849', 1899];
      dados[indice] = valor;
      assert.ok(new Livro(...dados).validarDados().length > 0);
    });
  }
}

for (const ano of [0, -1, 2024.5, '', '2024', null, undefined, NaN, Infinity]) {
  test(`rejeita ano inválido: ${String(ano)}`, () => {
    assert.ok(new Livro('Livro', 'Autor', '123', ano).validarDados().length > 0);
  });
}

test('aceita ano inteiro positivo e textos com espaços nas extremidades', () => {
  assert.deepEqual(new Livro(' Livro ', ' Autor ', ' 123 ', 1).validarDados(), []);
});
