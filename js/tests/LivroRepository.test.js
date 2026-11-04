import test from 'node:test';
import assert from 'node:assert';
import { Livro } from '../Livro.js';
import { LivroRepository } from '../LivroRepository.js';

test('RN02, RN04, RN05: cadastra livro válido com id automático e bloqueia ISBN duplicado', () => {
  const repo = new LivroRepository();

  const livro1 = new Livro('Clean Code', 'Robert Martin', '123456', 2008);
  const res1 = livro1.cadastrarLivro(repo);

  assert.strictEqual(res1.sucesso, true);
  assert.strictEqual(livro1.id, 1);


  const livro2 = new Livro('Outro Livro', 'Outro Autor', '123456', 2020);
  const res2 = livro2.cadastrarLivro(repo);

  assert.strictEqual(res2.sucesso, false);
});
