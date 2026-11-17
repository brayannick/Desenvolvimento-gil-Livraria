import { ContaRepository } from './ContaRepository.js';

const livro = document.getElementById('livro');
const estado = document.getElementById('estado');
const aviso = document.getElementById('avisoConta');
const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');
let telaAtual = 'login';
let temporizador;
let ocupado = true;

const versoFinal = document.getElementById('paginaLiteraria').cloneNode(true);
versoFinal.querySelector('#sessaoConta')?.remove();
versoFinal.removeAttribute('id');
versoFinal.removeAttribute('aria-label');
versoFinal.classList.add('verso-final');
document.getElementById('folhaFinal').append(versoFinal);

function concluir(focar = false) {
  clearTimeout(temporizador);
  document.getElementById('capa').hidden = true;
  livro.classList.remove('virando');
  livro.classList.add('aberto');
  livro.classList.remove('abrindo');
  document.getElementById(telaAtual).inert = false;
  ocupado = false;
  estado.textContent = '';
  if (focar) document.getElementById(`titulo-${telaAtual}`).focus();
}

function trocarTela(destino, atualizar) {
  if (ocupado || (destino === telaAtual && !atualizar)) return;
  ocupado = true;
  aviso.textContent = '';
  document.getElementById(telaAtual).inert = true;
  livro.classList.add('virando');
  estado.textContent = 'Virando as páginas…';
  temporizador = setTimeout(() => {
    document.getElementById(telaAtual).hidden = true;
    if (atualizar) atualizar();
    telaAtual = destino;
    livro.dataset.tela = destino;
    document.getElementById('sessaoConta').hidden = !['acervo', 'consulta'].includes(destino);
    if (['acervo', 'consulta'].includes(destino)) livro.classList.add('livro-cadastro');
    else livro.classList.remove('livro-cadastro');
    document.getElementById(telaAtual).hidden = false;
    temporizador = setTimeout(() => concluir(true), reduzirMovimento.matches ? 0 : 1100);
  }, reduzirMovimento.matches ? 0 : 500);
}

document.querySelectorAll('[data-destino]').forEach((botao) => {
  botao.addEventListener('click', () => trocarTela(botao.dataset.destino));
});

document.getElementById('listaLivros').addEventListener('virar-lista', (evento) => {
  evento.preventDefault();
  trocarTela('consulta', evento.detail);
});

document.getElementById('formCadastro').addEventListener('livro-cadastrado', () => trocarTela('consulta'));

for (const id of ['formLogin', 'formConta']) {
  document.getElementById(id).addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (ocupado) return;
    const formulario = document.getElementById(id);
    const botao = formulario.querySelector('button[type="submit"]');
    if (botao.disabled) return;
    botao.disabled = true;
    aviso.textContent = '';
    try {
      const contas = new ContaRepository(window.localStorage);
      const campos = formulario.elements;
      if (id === 'formConta') {
        await contas.cadastrar(campos.nome.value, campos.email.value, campos.senha.value);
        document.getElementById('emailLogin').value = campos.email.value.trim();
        formulario.reset();
        trocarTela('login');
        aviso.textContent = 'Conta criada com sucesso. Entre com seu e-mail e senha.';
      } else {
        const usuario = await contas.entrar(campos.email.value, campos.senha.value);
        document.getElementById('usuario').textContent = `Olá, ${usuario.nome}.`;
        trocarTela('acervo');
      }
    } catch (erro) {
      aviso.textContent = erro instanceof SyntaxError ? 'Dados de contas inválidos no armazenamento.' : erro.message;
    } finally {
      formulario.querySelector('input[type="password"]').value = '';
      botao.disabled = false;
    }
  });
}

document.getElementById('sair').addEventListener('click', () => {
  if (ocupado) return;
  try {
    new ContaRepository(window.localStorage).sair();
    document.getElementById('usuario').textContent = '';
    document.getElementById('formCadastro').reset();
    document.getElementById('mensagem').textContent = '';
    trocarTela('login');
  } catch {
    document.getElementById('mensagem').textContent = 'Não foi possível encerrar a sessão. Verifique o armazenamento do navegador.';
  }
});

// A abertura é decorativa; o formulário fica disponível imediatamente com movimento reduzido.
if (reduzirMovimento.matches) {
  concluir();
} else {
  requestAnimationFrame(() => {
    livro.classList.add('abrindo');
    temporizador = setTimeout(() => concluir(), 4450);
  });
}
