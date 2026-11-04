import test from 'node:test';
import assert from 'node:assert/strict';
import { Livro } from '../js/Livro.js';
import { LivroRepository } from '../js/LivroRepository.js';

function criarStorage() {
  const dados = new Map();
  return {
    getItem: (chave) => (dados.has(chave) ? dados.get(chave) : null),
    setItem: (chave, valor) => dados.set(chave, String(valor)),
  };
}

test('CA01: livro com dados válidos é cadastrado e recebe id', () => {
  const repositorio = new LivroRepository(criarStorage());
  const livro = new Livro('Dom Casmurro', 'Machado de Assis', '9788535914849', 1899);

  assert.equal(livro.id, null);
  assert.deepEqual(livro.validarDados(), []);
  assert.deepEqual(livro.cadastrarLivro(repositorio), {
    sucesso: true,
    mensagem: 'Livro cadastrado com sucesso.',
  });
  assert.equal(livro.id, 1);
  assert.equal(repositorio.listar().length, 1);
});

test('CA02: rejeita campos vazios, na ordem título, autor, ISBN, ano', () => {
  const repositorio = new LivroRepository(criarStorage());
  const livro = new Livro(' \t', '', null, undefined);

  assert.deepEqual(livro.validarDados(), [
    'Informe o título.',
    'Informe o autor.',
    'Informe o ISBN.',
    'Informe o ano de publicação.',
  ]);
  assert.deepEqual(livro.cadastrarLivro(repositorio), {
    sucesso: false,
    mensagem: 'Informe o título. Informe o autor. Informe o ISBN. Informe o ano de publicação.',
  });
  assert.deepEqual(repositorio.listar(), []);
  assert.equal(livro.id, null);
});

for (const indice of [0, 1, 2]) {
  for (const valor of ['', '   ', '\t\n', null, undefined]) {
    test(`CA02: rejeita campo de texto ${indice} com valor ${JSON.stringify(valor)}`, () => {
      const dados = ['Dom Casmurro', 'Machado de Assis', '9788535914849', 1899];
      dados[indice] = valor;
      assert.equal(new Livro(...dados).validarDados().length, 1);
    });
  }
}

for (const ano of [0, -1, 1.5, '2024', Infinity]) {
  test(`CA04: rejeita ano inválido ${String(ano)}`, () => {
    assert.deepEqual(new Livro('Título', 'Autor', '123', ano).validarDados(), [
      'O ano de publicação deve ser um número inteiro positivo.',
    ]);
  });
}

for (const ano of [null, undefined, NaN]) {
  test(`CA02: ano ${String(ano)} conta como campo vazio`, () => {
    assert.deepEqual(new Livro('Título', 'Autor', '123', ano).validarDados(), [
      'Informe o ano de publicação.',
    ]);
  });
}

test('aceita ano inteiro positivo e textos com espaços nas extremidades', () => {
  assert.deepEqual(new Livro(' Livro ', ' Autor ', ' 123 ', 1).validarDados(), []);
});

const formatosIsbn = ['978-85-359-1484-9', '978 85 359 1484 9', '9788535914849'];

for (const primeiroIsbn of formatosIsbn) {
  test(`CA03: rejeita ISBN duplicado em qualquer formato (primeiro: ${primeiroIsbn})`, () => {
    const repositorio = new LivroRepository(criarStorage());
    const primeiro = new Livro('Título', 'Autor', primeiroIsbn, 2024);
    assert.equal(primeiro.cadastrarLivro(repositorio).sucesso, true);
    assert.equal(primeiro.id, 1);

    for (const isbn of formatosIsbn) {
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

test('informa erro e não define id quando o storage falha ao gravar', () => {
  const storage = criarStorage();
  storage.setItem = () => {
    throw new Error('cota excedida');
  };
  const livro = new Livro('Título', 'Autor', '123', 2024);

  assert.deepEqual(livro.cadastrarLivro(new LivroRepository(storage)), {
    sucesso: false,
    mensagem: 'Não foi possível salvar o livro. Tente novamente.',
  });
  assert.equal(livro.id, null);
});
