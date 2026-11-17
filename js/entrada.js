const livro = document.getElementById('livro');
const pular = document.getElementById('pular');
const estado = document.getElementById('estado');
const aviso = document.getElementById('avisoConta');
const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');
let telaAtual = 'login';
let temporizador;
let ocupado = true;

function concluir(focar = false) {
  clearTimeout(temporizador);
  livro.classList.remove('virando');
  livro.classList.add('aberto');
  livro.classList.remove('abrindo');
  document.getElementById(telaAtual).inert = false;
  ocupado = false;
  pular.hidden = true;
  estado.textContent = '';
  if (focar) document.getElementById(`titulo-${telaAtual}`).focus();
}

function trocarTela(destino) {
  if (ocupado || destino === telaAtual) return;
  ocupado = true;
  aviso.textContent = '';
  document.getElementById(telaAtual).inert = true;
  livro.classList.add('virando');
  estado.textContent = 'Virando as páginas…';
  temporizador = setTimeout(() => {
    document.getElementById(telaAtual).hidden = true;
    telaAtual = destino;
    livro.dataset.tela = destino;
    document.getElementById(telaAtual).hidden = false;
    temporizador = setTimeout(() => concluir(true), reduzirMovimento.matches ? 0 : 600);
  }, reduzirMovimento.matches ? 0 : 450);
}

pular.addEventListener('click', () => concluir(true));
document.querySelectorAll('[data-destino]').forEach((botao) => {
  botao.addEventListener('click', () => trocarTela(botao.dataset.destino));
});

for (const id of ['formLogin', 'formConta']) {
  document.getElementById(id).addEventListener('submit', (evento) => {
    evento.preventDefault();
    aviso.textContent = 'Esta é uma prévia. O acesso por conta ainda não está disponível. Você pode explorar o cadastro de livros pelo link abaixo.';
    document.getElementById(id).querySelector('input[type="password"]').value = '';
  });
}

// A abertura é decorativa; o formulário fica disponível imediatamente com movimento reduzido.
if (reduzirMovimento.matches) {
  concluir();
} else {
  requestAnimationFrame(() => {
    livro.classList.add('abrindo');
    temporizador = setTimeout(() => concluir(), 3200);
  });
}
