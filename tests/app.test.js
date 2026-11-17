import test from 'node:test';
import assert from 'node:assert/strict';

test('formulário cadastra, persiste e exibe erro de ISBN duplicado', async (t) => {
  const dados = new Map();
  const campos = {
    titulo: { value: 'Dom Casmurro', focus() {} },
    autor: { value: 'Machado de Assis' },
    isbn: { value: '123' },
    anoPublicacao: { value: '1899' },
  };
  let enviar;
  let limpezas = 0;
  let cadastros = 0;
  const botao = { disabled: false };
  const formulario = {
    elements: campos,
    dispatchEvent(evento) { assert.equal(evento.type, 'livro-cadastrado'); cadastros++; },
    addEventListener(evento, callback) { assert.equal(evento, 'submit'); enviar = callback; },
    reset() { limpezas++; },
    querySelector() { return botao; },
  };
  const mensagem = {};
  let pesquisar;
  const pesquisa = { value: '', addEventListener(evento, callback) { pesquisar = callback; } };
  const lista = { dispatchEvent() { return true; }, itens: [], replaceChildren() { this.itens = []; }, append(item) { this.itens.push(item); } };
  const resultadoBusca = {};
  const navegacao = {};
  const anterior = { parentElement: navegacao, addEventListener(tipo, callback) { this.clicar = callback; } };
  const proxima = { addEventListener(tipo, callback) { this.clicar = callback; } };
  const paginaAtual = {};
  t.after(() => { delete globalThis.document; delete globalThis.window; });
  globalThis.document = {
    createElement() { return { filhos: [], append(...filhos) { this.filhos.push(...filhos); } }; },
    getElementById(id) { return { formCadastro: formulario, mensagem, pesquisaTitulo: pesquisa, listaLivros: lista, resultadoBusca, paginaAnterior: anterior, proximaPagina: proxima, paginaAtual }[id] ?? null; },
  };
  globalThis.window = { localStorage: {
    getItem(chave) { return dados.get(chave) ?? null; },
    setItem(chave, valor) { dados.set(chave, valor); },
  } };
  await import('../js/app.js?cadastro');
  assert.match(resultadoBusca.textContent, /Nenhum livro cadastrado/);
  const evento = { preventDefault() {} };
  pesquisa.value = 'outro título';
  enviar(evento);
  assert.equal(mensagem.className, 'sucesso');
  assert.equal(cadastros, 1);
  assert.equal(pesquisa.value, '');
  assert.equal(lista.itens[0].filhos[0].textContent, 'Dom Casmurro');
  pesquisa.value = 'CASM';
  pesquisar();
  assert.equal(lista.itens.length, 1);
  pesquisa.value = 'ausente';
  pesquisar();
  assert.equal(lista.itens.length, 0);
  assert.match(resultadoBusca.textContent, /Nenhum livro encontrado/);
  pesquisa.value = '';
  pesquisar();
  assert.equal(lista.itens.length, 1);
  assert.equal(limpezas, 1);
  assert.equal(JSON.parse(dados.get('biblioteca.livros')).livros[0].titulo, 'Dom Casmurro');
  enviar(evento);
  assert.equal(mensagem.className, 'erro');
  assert.equal(cadastros, 1);
  assert.match(mensagem.textContent, /ISBN/);
  assert.equal(limpezas, 1);

  for (let i = 0; i < 10; i++) {
    campos.titulo.value = `Livro ${i}`;
    campos.isbn.value = `isbn-${i}`;
    enviar(evento);
  }
  assert.equal(lista.itens.length, 5);
  assert.equal(paginaAtual.textContent, '1 / 3');
  assert.equal(anterior.disabled, true);
  proxima.clicar();
  assert.equal(paginaAtual.textContent, '2 / 3');
  assert.equal(lista.itens[0].filhos[0].textContent, 'Livro 4');
  proxima.clicar();
  assert.equal(lista.itens.length, 1);
  assert.equal(proxima.disabled, true);
  anterior.clicar();
  assert.equal(paginaAtual.textContent, '2 / 3');
  pesquisa.value = 'Casmurro';
  pesquisar();
  assert.equal(paginaAtual.textContent, '1 / 1');
  assert.equal(navegacao.hidden, true);
  assert.equal(lista.itens[0].filhos[0].textContent, 'Dom Casmurro');

  dados.set('biblioteca.livros', '{corrompido');
  await import('../js/app.js?corrompido');
  assert.equal(botao.disabled, true);
  assert.match(mensagem.textContent, /Não foi possível acessar/);
  enviar(evento);
  assert.equal(dados.get('biblioteca.livros'), '{corrompido');
});
