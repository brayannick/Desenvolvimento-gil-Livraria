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
  const botao = { disabled: false };
  const formulario = {
    elements: campos,
    addEventListener(evento, callback) { assert.equal(evento, 'submit'); enviar = callback; },
    reset() { limpezas++; },
    querySelector() { return botao; },
  };
  const mensagem = {};
  t.after(() => { delete globalThis.document; delete globalThis.window; });
  globalThis.document = {
    getElementById(id) { return id === 'formCadastro' ? formulario : mensagem; },
  };
  globalThis.window = { localStorage: {
    getItem(chave) { return dados.get(chave) ?? null; },
    setItem(chave, valor) { dados.set(chave, valor); },
  } };
  await import('../js/app.js?cadastro');
  const evento = { preventDefault() {} };
  enviar(evento);
  assert.equal(mensagem.className, 'sucesso');
  assert.equal(limpezas, 1);
  assert.equal(JSON.parse(dados.get('biblioteca.livros')).livros[0].titulo, 'Dom Casmurro');
  enviar(evento);
  assert.equal(mensagem.className, 'erro');
  assert.match(mensagem.textContent, /ISBN/);
  assert.equal(limpezas, 1);

  dados.set('biblioteca.livros', '{corrompido');
  await import('../js/app.js?corrompido');
  assert.equal(botao.disabled, true);
  assert.match(mensagem.textContent, /Não foi possível acessar/);
  enviar(evento);
  assert.equal(dados.get('biblioteca.livros'), '{corrompido');
});
