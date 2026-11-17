import { Livro } from './Livro.js';
import { LivroRepository } from './LivroRepository.js';

const formulario = document.getElementById('formCadastro');
const mensagem = document.getElementById('mensagem');
const pesquisa = document.getElementById('pesquisaTitulo');
const lista = document.getElementById('listaLivros');
const resultadoBusca = document.getElementById('resultadoBusca');
const anterior = document.getElementById('paginaAnterior');
const proxima = document.getElementById('proximaPagina');
const paginaAtual = document.getElementById('paginaAtual');
let pagina = 0;
const LIVROS_POR_PAGINA = 5;
let repositorio;
try {
  repositorio = new LivroRepository(window.localStorage);
} catch {
  exibirMensagem('Não foi possível acessar os livros salvos. Verifique o armazenamento do navegador.', false);
  formulario.querySelector('button').disabled = true;
  if (pesquisa) {
    pesquisa.disabled = true;
    resultadoBusca.textContent = 'Não foi possível acessar os livros salvos.';
  }
}

function atualizarLista() {
  if (!pesquisa || !repositorio) return;
  const livros = repositorio.buscarPorTitulo(pesquisa.value);
  const paginas = Math.max(1, Math.ceil(livros.length / LIVROS_POR_PAGINA));
  pagina = Math.min(pagina, paginas - 1);
  if (anterior) {
    anterior.parentElement.hidden = paginas <= 1;
    anterior.disabled = pagina === 0;
    proxima.disabled = pagina === paginas - 1;
    paginaAtual.textContent = `${pagina + 1} / ${paginas}`;
  }
  lista.replaceChildren();
  for (const livro of livros.slice(pagina * LIVROS_POR_PAGINA, (pagina + 1) * LIVROS_POR_PAGINA)) {
    const item = document.createElement('li');
    const titulo = document.createElement('h3');
    titulo.textContent = livro.titulo;
    titulo.title = livro.titulo;
    const detalhes = document.createElement('p');
    detalhes.textContent = `${livro.autor} · ${livro.anoPublicacao} · ISBN: ${livro.isbn}`;
    detalhes.title = detalhes.textContent;
    item.append(titulo, detalhes);
    lista.append(item);
  }
  resultadoBusca.textContent = livros.length ? `${livros.length} livro(s) encontrado(s).` :
    pesquisa.value.trim() ? 'Nenhum livro encontrado com este título.' : 'Nenhum livro cadastrado ainda.';
}

function mudarPagina(deslocamento) {
  const atualizar = () => { pagina += deslocamento; atualizarLista(); };
  const evento = new CustomEvent('virar-lista', { cancelable: true, detail: atualizar });
  if (lista.dispatchEvent(evento)) atualizar();
}
anterior?.addEventListener('click', () => mudarPagina(-1));
proxima?.addEventListener('click', () => mudarPagina(1));
pesquisa?.addEventListener('input', () => { pagina = 0; atualizarLista(); });
atualizarLista();

function lerAno(texto) {
  const valor = texto.trim();
  return valor === '' ? NaN : Number(valor);
}

function exibirMensagem(texto, sucesso) {
  mensagem.className = sucesso ? 'sucesso' : 'erro';
  mensagem.textContent = texto;
}

formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();

  if (!repositorio) return;

  const campos = formulario.elements;
  const livro = new Livro(
    campos.titulo.value,
    campos.autor.value,
    campos.isbn.value,
    lerAno(campos.anoPublicacao.value)
  );

  const resultado = livro.cadastrarLivro(repositorio);
  exibirMensagem(resultado.mensagem, resultado.sucesso);

  if (resultado.sucesso) {
    if (pesquisa) pesquisa.value = '';
    pagina = 0;
    atualizarLista();
    formulario.reset();
    campos.titulo.focus();
    formulario.dispatchEvent(new Event('livro-cadastrado'));
  }
});
