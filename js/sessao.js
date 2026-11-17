import { ContaRepository } from './ContaRepository.js';

const usuario = document.getElementById('usuario');
const sair = document.getElementById('sair');
try {
  const contas = new ContaRepository(window.localStorage);
  const sessao = contas.sessao();
  if (sessao) {
    usuario.textContent = `Olá, ${sessao.nome}.`;
    sair.hidden = false;
    sair.addEventListener('click', () => {
      try {
        contas.sair();
        window.location.href = 'index.html';
      } catch {
        usuario.textContent = 'Não foi possível encerrar a sessão. Verifique o armazenamento do navegador.';
      }
    });
  }
} catch {
  usuario.textContent = 'Não foi possível acessar a sessão salva.';
}
