import test from 'node:test';
import assert from 'node:assert';
import Livro from '../js/Livro.js';
import LivroRepository from '../js/LivroRepository.js';

test('CA01: Cadastrar livro com dados válidos com sucesso', () => {
  const repo = new LivroRepository();
  const livro = new Livro('Dom Casmurro', 'Machado de Assis', '978-85-0', 1899);
  const resultado = livro.cadastrarLivro(repo);
  assert.strictEqual(resultado.sucesso, true);
});

test('CA02: Rejeitar cadastro com campos vazios', () => {
  const repo = new LivroRepository();
  const livro = new Livro('', '', '', 2020);
  const resultado = livro.cadastrarLivro(repo);
  assert.strictEqual(resultado.sucesso, false);
});

test('CA03: Rejeitar ISBN já cadastrado', () => {
  const repo = new LivroRepository();
  const l1 = new Livro('Livro 1', 'Autor 1', '111', 2020);
  l1.cadastrarLivro(repo);

  const l2 = new Livro('Livro 2', 'Autor 2', '111', 2021);
  const resultado = l2.cadastrarLivro(repo);
  assert.strictEqual(resultado.sucesso, false);
});

test('CA04: Rejeitar ano de publicação inválido', () => {
  const repo = new LivroRepository();
  const livro = new Livro('Livro Futuro', 'Autor', '222', -500);
  const resultado = livro.cadastrarLivro(repo);
  assert.strictEqual(resultado.sucesso, false);
});

test('CA05: Exibir mensagem de sucesso/erro adequada', () => {
  const repo = new LivroRepository();
  const livro = new Livro('Refactoring', 'Martin Fowler', '333', 1999);
  const resultado = livro.cadastrarLivro(repo);
  assert.ok(resultado.mensagem);
});
