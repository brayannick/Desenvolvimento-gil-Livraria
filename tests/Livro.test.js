import test from 'node:test';
import assert from 'node:assert';
import Livro from '../js/Livro.js';

test('CA01: dados válidos retornam lista de erros vazia', () => {
  const livro = new Livro('O Hobbit', 'J.R.R. Tolkien', '978-85-336-1337-1', 1937);
  const erros = livro.validarDados();
  assert.strictEqual(erros.length, 0);
});

test('CA02: campos vazios ou com espaços geram erros de obrigatoriedade', () => {
  const livro = new Livro('   ', '', '978-85-336-1337-1', 1937);
  const erros = livro.validarDados();
  assert.ok(erros.length > 0);
});

test('CA04: anos inválidos (zero, negativo, decimais ou textos) geram erro', () => {
  const livro1 = new Livro('Livro A', 'Autor A', '123', 0);
  const livro2 = new Livro('Livro B', 'Autor B', '123', -2020);
  const livro3 = new Livro('Livro C', 'Autor C', '123', 2020.5);

  assert.ok(livro1.validarDados().length > 0);
  assert.ok(livro2.validarDados().length > 0);
  assert.ok(livro3.validarDados().length > 0);
});
