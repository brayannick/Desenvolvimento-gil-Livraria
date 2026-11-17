import test from 'node:test';
import assert from 'node:assert/strict';
import { ContaRepository } from '../js/ContaRepository.js';

function storage() {
  const dados = new Map();
  return { getItem: chave => dados.get(chave) ?? null, setItem: (chave, valor) => dados.set(chave, valor), removeItem: chave => dados.delete(chave) };
}

test('cadastra, restaura, autentica e encerra sessão sem salvar senha em texto', async () => {
  const dados = storage();
  const contas = new ContaRepository(dados);
  await contas.cadastrar(' Ana ', ' ANA@example.com ', 'senha-secreta');
  assert.equal(dados.getItem('biblioteca.contas').includes('senha-secreta'), false);
  const restaurado = new ContaRepository(dados);
  assert.deepEqual(await restaurado.entrar('ANA@example.com', 'senha-secreta'), { nome: 'Ana', email: 'ana@example.com' });
  assert.equal(new ContaRepository(dados).sessao().nome, 'Ana');
  contas.sair();
  assert.equal(contas.sessao(), null);
  await assert.rejects(contas.cadastrar('Outra', 'ana@example.com', 'outra-senha'), /Já existe/);
  await assert.rejects(contas.entrar('ana@example.com', 'incorreta'), /incorretos/);
  await assert.rejects(contas.entrar('ausente@example.com', 'senha-secreta'), /incorretos/);
  assert.equal(contas.sessao(), null);
});

test('rejeita campos inválidos e preserva dados corrompidos ou bloqueados', async () => {
  const dados = storage();
  const contas = new ContaRepository(dados);
  for (const campos of [[' ', 'ana@example.com', '12345678'], ['Ana', 'invalido', '12345678'], ['Ana', 'ana@example.com', 'curta']]) {
    await assert.rejects(contas.cadastrar(...campos), /Informe/);
  }
  dados.setItem('biblioteca.contas', '{');
  await assert.rejects(contas.cadastrar('Ana', 'ana@example.com', '12345678'));
  assert.equal(dados.getItem('biblioteca.contas'), '{');
  dados.setItem('biblioteca.contas', '{}');
  assert.throws(() => contas.listar(), /inválidos/);
  dados.removeItem('biblioteca.contas');
  dados.setItem = () => { throw new Error('Bloqueado'); };
  await assert.rejects(contas.cadastrar('Ana', 'ana@example.com', '12345678'), /Bloqueado/);
  assert.deepEqual(contas.listar(), []);
});
