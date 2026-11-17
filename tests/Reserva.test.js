import test from 'node:test';
import assert from 'node:assert';
import Reserva from '../js/Reserva.js';
import ReservaRepository from '../js/ReservaRepository.js';

test('RN10: Permite criar uma reserva associada à edição/livro, sem amarrar a exemplar específico', () => {
  const repo = new ReservaRepository();
  const reserva = new Reserva('usuario123', 'livro-uuid-999');
  
  const resultado = reserva.salvarReserva(repo);
  
  assert.strictEqual(resultado.sucesso, true);
  assert.strictEqual(repo.listarReservas().length, 1);
  assert.strictEqual(repo.listarReservas()[0].exemplarEspecifico, undefined); // Sem exemplar físico
});

test('RN11: Impede que o mesmo usuário tenha mais de uma reserva ATIVA para a mesma edição', () => {
  const repo = new ReservaRepository();
  
  const reserva1 = new Reserva('usuario123', 'livro-uuid-999');
  reserva1.salvarReserva(repo);

  // Tentando criar outra reserva ativa para o mesmo usuário e livro
  const reserva2 = new Reserva('usuario123', 'livro-uuid-999');
  const resultado = reserva2.salvarReserva(repo);

  assert.strictEqual(resultado.sucesso, false);
  assert.strictEqual(repo.listarReservas().length, 1); // Continua apenas 1
});

test('Fila: A fila deve ordenar as reservas por ordem de chegada (data/hora)', () => {
  const repo = new ReservaRepository();
  
  const r1 = new Reserva('usuarioA', 'livro-1');
  const r2 = new Reserva('usuarioB', 'livro-1');
  
  r1.salvarReserva(repo);
  r2.salvarReserva(repo);

  const fila = repo.obterFilaPorLivro('livro-1');
  assert.strictEqual(fila[0].usuarioId, 'usuarioA');
  assert.strictEqual(fila[1].usuarioId, 'usuarioB');
});
