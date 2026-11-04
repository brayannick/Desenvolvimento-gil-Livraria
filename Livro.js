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

    if (campoVazio(this.titulo)) erros.push('Informe o título.');
    if (campoVazio(this.autor)) erros.push('Informe o autor.');
    if (campoVazio(this.isbn)) erros.push('Informe o ISBN.');

    if (campoVazio(this.anoPublicacao)) {
      erros.push('Informe o ano de publicação.');
    } else if (!anoValido(this.anoPublicacao)) {
      erros.push('O ano de publicação deve ser um número inteiro positivo.');
    }

    return erros;
  }

  cadastrarLivro(repositorio) {
    const erros = this.validarDados();
    if (erros.length > 0) {
      return { sucesso: false, mensagem: erros.join(' ') };
    }

    if (repositorio.existeIsbn(this.isbn)) {
      return { sucesso: false, mensagem: 'Já existe um livro cadastrado com este ISBN.' };
    }

    repositorio.salvar(this);
    return { sucesso: true, mensagem: 'Livro cadastrado com sucesso.' };
  }
}
