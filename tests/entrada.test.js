import test from 'node:test';
import assert from 'node:assert/strict';

test('abre o livro, troca telas com foco e não armazena senhas', async (t) => {
  const elementos = new Map();
  function elemento(id) {
    if (!elementos.has(id)) elementos.set(id, {
      id, hidden: ['cadastro', 'acervo', 'consulta', 'sessaoConta'].includes(id), inert: true, dataset: {}, textContent: '', value: 'senha-teste', disabled: false,
      elements: { nome: { value: 'Ana' }, email: { value: 'ana@example.com' }, senha: { value: 'senha-teste' } },
      reset() {},
      classes: new Set(), eventos: {},
      classList: { add(...nomes) { nomes.forEach(n => elemento(id).classes.add(n)); }, remove(...nomes) { nomes.forEach(n => elemento(id).classes.delete(n)); } },
      addEventListener(evento, callback) { this.eventos[evento] = callback; },
      focus() { this.focado = true; },
      cloneNode() { return elemento(`${id}-clone`); },
      removeAttribute(nome) { delete this[nome]; },
      append(filho) { this.filho = filho; },
      querySelector(seletor) { return seletor === '#sessaoConta' ? null : elemento(`${id}-senha`); },
    });
    return elementos.get(id);
  }
  const criar = elemento('criar'); criar.dataset.destino = 'cadastro';
  const entrar = elemento('entrar'); entrar.dataset.destino = 'login';
  const consulta = elemento('verLivros'); consulta.dataset.destino = 'consulta';
  const acervo = elemento('voltarCadastro'); acervo.dataset.destino = 'acervo';
  const anteriores = { document: globalThis.document, window: globalThis.window, requestAnimationFrame: globalThis.requestAnimationFrame };
  t.after(() => {
    for (const [nome, valor] of Object.entries(anteriores)) {
      if (valor === undefined) delete globalThis[nome]; else globalThis[nome] = valor;
    }
  });
  globalThis.document = { getElementById: elemento, querySelectorAll: () => [criar, entrar, consulta, acervo] };
  const dados = new Map();
  globalThis.window = { matchMedia: () => ({ matches: false }), localStorage: { getItem: chave => dados.get(chave) ?? null, setItem: (chave, valor) => dados.set(chave, valor), removeItem: chave => dados.delete(chave) }, location: {} };
  globalThis.requestAnimationFrame = callback => callback();
  const tarefas = new Map(); const duracoes = []; let id = 0;
  t.mock.method(globalThis, 'setTimeout', (callback, duracao) => { duracoes.push(duracao); tarefas.set(++id, callback); return id; });
  t.mock.method(globalThis, 'clearTimeout', chave => tarefas.delete(chave));
  function avancar() { const [chave, callback] = tarefas.entries().next().value; tarefas.delete(chave); callback(); }
  await import('../js/entrada.js?teste');
  assert.equal(elemento('livro').classes.has('abrindo'), true);
  assert.equal(elemento('folhaFinal').filho.id, undefined);
  assert.equal(elemento('folhaFinal').filho.classes.has('verso-final'), true);
  assert.equal(elemento('login').inert, true);
  avancar();
  assert.equal(elemento('livro').classes.has('aberto'), true);
  assert.equal(elemento('capa').hidden, true);
  assert.equal(elemento('login').inert, false);
  criar.eventos.click();
  assert.equal(elemento('login').inert, true);
  entrar.eventos.click(); // Uma troca em andamento não pode ser reiniciada.
  avancar(); avancar();
  assert.equal(elemento('login').hidden, true);
  assert.equal(elemento('cadastro').hidden, false);
  assert.equal(elemento('cadastro').inert, false);
  assert.equal(elemento('titulo-cadastro').focado, true);
  await elemento('formConta').eventos.submit({ preventDefault() {} });
  assert.equal(elemento('formConta-senha').value, '');
  assert.match(elemento('avisoConta').textContent, /Conta criada/);
  avancar(); avancar();
  await elemento('formLogin').eventos.submit({ preventDefault() {} });
  assert.equal(window.location.href, undefined);
  assert.equal(elemento('livro').classes.has('virando'), true);
  assert.equal(elemento('login').inert, true);
  assert.equal(duracoes.at(-1), 500);
  assert.equal(elemento('acervo').hidden, true);
  avancar();
  assert.equal(duracoes.at(-1), 1100);
  assert.equal(elemento('acervo').inert, true);
  avancar();
  assert.equal(elemento('acervo').hidden, false);
  assert.equal(elemento('sessaoConta').hidden, false);
  assert.equal(elemento('usuario').textContent, 'Olá, Ana.');
  assert.equal(elemento('acervo').inert, false);
  assert.equal(elemento('titulo-acervo').focado, true);
  assert.equal(elemento('livro').dataset.tela, 'acervo');
  assert.equal(elemento('livro').classes.has('livro-cadastro'), true);
  assert.equal(JSON.parse(dados.get('biblioteca.sessao')).email, 'ana@example.com');
  consulta.eventos.click();
  avancar(); avancar();
  assert.equal(elemento('consulta').hidden, false);
  assert.equal(elemento('consulta').inert, false);
  assert.equal(elemento('titulo-consulta').focado, true);
  assert.equal(elemento('sessaoConta').hidden, false);
  let atualizacoes = 0;
  elemento('listaLivros').eventos['virar-lista']({ preventDefault() {}, detail() { atualizacoes++; } });
  assert.equal(atualizacoes, 0);
  assert.equal(elemento('livro').classes.has('virando'), true);
  avancar(); avancar();
  assert.equal(atualizacoes, 1);
  assert.equal(elemento('consulta').hidden, false);
  acervo.eventos.click();
  avancar(); avancar();
  assert.equal(elemento('consulta').hidden, true);
  assert.equal(elemento('acervo').hidden, false);
  elemento('formCadastro').eventos['livro-cadastrado']();
  assert.equal(elemento('livro').classes.has('virando'), true);
  avancar(); avancar();
  assert.equal(elemento('consulta').hidden, false);
  assert.equal(elemento('titulo-consulta').focado, true);
  elemento('sair').eventos.click();
  avancar(); avancar();
  assert.equal(dados.has('biblioteca.sessao'), false);
  assert.equal(elemento('acervo').hidden, true);
  assert.equal(elemento('sessaoConta').hidden, true);
  assert.equal(elemento('login').hidden, false);
  assert.equal(elemento('cadastro').hidden, true);
  assert.equal(elemento('titulo-login').focado, true);
  assert.equal(elemento('capa').hidden, true);

  globalThis.window.matchMedia = () => ({ matches: true });
  await import('../js/entrada.js?reduzido');
  assert.equal(elemento('login').inert, false);
  assert.equal(tarefas.size, 0);
  assert.equal(elemento('capa').hidden, true);
});
