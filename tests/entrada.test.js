import test from 'node:test';
import assert from 'node:assert/strict';

test('abre o livro, troca telas com foco e não armazena senhas', async (t) => {
  const elementos = new Map();
  function elemento(id) {
    if (!elementos.has(id)) elementos.set(id, {
      hidden: id === 'cadastro', inert: true, dataset: {}, textContent: '', value: 'senha-teste',
      classes: new Set(), eventos: {},
      classList: { add(...nomes) { nomes.forEach(n => elemento(id).classes.add(n)); }, remove(...nomes) { nomes.forEach(n => elemento(id).classes.delete(n)); } },
      addEventListener(evento, callback) { this.eventos[evento] = callback; },
      focus() { this.focado = true; },
      querySelector() { return elemento(`${id}-senha`); },
    });
    return elementos.get(id);
  }
  const criar = elemento('criar'); criar.dataset.destino = 'cadastro';
  const entrar = elemento('entrar'); entrar.dataset.destino = 'login';
  const anteriores = { document: globalThis.document, window: globalThis.window, requestAnimationFrame: globalThis.requestAnimationFrame };
  t.after(() => {
    for (const [nome, valor] of Object.entries(anteriores)) {
      if (valor === undefined) delete globalThis[nome]; else globalThis[nome] = valor;
    }
  });
  globalThis.document = { getElementById: elemento, querySelectorAll: () => [criar, entrar] };
  globalThis.window = { matchMedia: () => ({ matches: false }) };
  globalThis.requestAnimationFrame = callback => callback();
  const tarefas = new Map(); let id = 0;
  t.mock.method(globalThis, 'setTimeout', callback => { tarefas.set(++id, callback); return id; });
  t.mock.method(globalThis, 'clearTimeout', chave => tarefas.delete(chave));
  function avancar() { const [chave, callback] = tarefas.entries().next().value; tarefas.delete(chave); callback(); }
  await import('../js/entrada.js?teste');
  assert.equal(elemento('livro').classes.has('abrindo'), true);
  assert.equal(elemento('login').inert, true);
  avancar();
  assert.equal(elemento('livro').classes.has('aberto'), true);
  assert.equal(elemento('login').inert, false);
  criar.eventos.click();
  assert.equal(elemento('login').inert, true);
  entrar.eventos.click(); // Uma troca em andamento não pode ser reiniciada.
  avancar(); avancar();
  assert.equal(elemento('login').hidden, true);
  assert.equal(elemento('cadastro').hidden, false);
  assert.equal(elemento('cadastro').inert, false);
  assert.equal(elemento('titulo-cadastro').focado, true);
  elemento('formConta').eventos.submit({ preventDefault() {} });
  assert.equal(elemento('formConta-senha').value, '');
  assert.match(elemento('avisoConta').textContent, /prévia/);
  entrar.eventos.click(); avancar(); avancar();
  assert.equal(elemento('login').hidden, false);
  assert.equal(elemento('cadastro').hidden, true);
  assert.equal(elemento('titulo-login').focado, true);

  await import('../js/entrada.js?pular');
  elemento('pular').eventos.click();
  assert.equal(tarefas.size, 0);
  assert.equal(elemento('pular').hidden, true);

  globalThis.window.matchMedia = () => ({ matches: true });
  await import('../js/entrada.js?reduzido');
  assert.equal(elemento('login').inert, false);
  assert.equal(tarefas.size, 0);
});
