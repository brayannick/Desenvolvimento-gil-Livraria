import { Livro } from './Livro.js';
import { LivroRepository } from './LivroRepository.js';

const formulario = document.getElementById('formCadastro');
const mensagem = document.getElementById('mensagem');
let repositorio;
try {
  repositorio = new LivroRepository(window.localStorage);
} catch {
  exibirMensagem('Não foi possível acessar os livros salvos. Verifique o armazenamento do navegador.', false);
  formulario.querySelector('button').disabled = true;
}

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
    formulario.reset();
    campos.titulo.focus();
  }
});
