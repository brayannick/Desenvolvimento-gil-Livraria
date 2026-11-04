import { MENSAGENS } from './mensagens.js';

function campoVazio(valor) {
  if (valor === null || valor === undefined) return true;
  if (typeof valor === 'number') return Number.isNaN(valor);
  return String(valor).trim() === '';
}

function anoValido(ano) {
  return Number.isInteger(ano) && ano > 0;
}

export class Livro {
  constructor(titulo, autor, isbn, anoPublicacao) {
    this.id = null;
    this.titulo = titulo;
    this.autor = autor;
    this.isbn = isbn;
    this.anoPublicacao = anoPublicacao;
  }

  validarDados() {
    const erros = [];

    if (campoVazio(this.titulo)) erros.push(MENSAGENS.TITULO_OBRIGATORIO);
    if (campoVazio(this.autor)) erros.push(MENSAGENS.AUTOR_OBRIGATORIO);
    if (campoVazio(this.isbn)) erros.push(MENSAGENS.ISBN_OBRIGATORIO);

    if (campoVazio(this.anoPublicacao)) {
      erros.push(MENSAGENS.ANO_OBRIGATORIO);
    } else if (!anoValido(this.anoPublicacao)) {
      erros.push(MENSAGENS.ANO_INVALIDO);
    }

    return erros;
  }

  cadastrarLivro(repositorio) {
    const erros = this.validarDados();
    if (erros.length > 0) {
      return { sucesso: false, mensagem: erros.join(' ') };
    }

    if (repositorio.existeIsbn(this.isbn)) {
      return { sucesso: false, mensagem: MENSAGENS.ISBN_DUPLICADO };
    }

    repositorio.salvar(this);
    return { sucesso: true, mensagem: MENSAGENS.CADASTRO_SUCESSO };
  }
}
