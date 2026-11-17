export const MENSAGENS = Object.freeze({
  TITULO_OBRIGATORIO: 'Informe o título.',
  AUTOR_OBRIGATORIO: 'Informe o autor.',
  ISBN_OBRIGATORIO: 'Informe o ISBN.',
  ANO_OBRIGATORIO: 'Informe o ano de publicação.',
  ANO_INVALIDO: 'O ano de publicação deve ser um número inteiro positivo.',
  ISBN_DUPLICADO: 'Já existe um livro cadastrado com este ISBN.',
  ERRO_AO_SALVAR: 'Não foi possível salvar o livro. Tente novamente.',
  CADASTRO_SUCESSO: 'Livro cadastrado com sucesso.',
});

function campoVazio(valor) {
  if (valor === null || valor === undefined) return true;
  if (typeof valor === 'number') return Number.isNaN(valor);
  return String(valor).trim() === '';
}

export class Livro {
  constructor(titulo, autor, isbn, anoPublicacao) {
    this.id = null;
    this.titulo = titulo;
    this.autor = autor;
    this.isbn = isbn;
    this.anoPublicacao = anoPublicacao;
  }

  // Retorna a lista de mensagens de erro (lista vazia = dados válidos).
  validarDados() {
    const erros = [];

    if (campoVazio(this.titulo)) erros.push(MENSAGENS.TITULO_OBRIGATORIO);
    if (campoVazio(this.autor)) erros.push(MENSAGENS.AUTOR_OBRIGATORIO);
    if (campoVazio(this.isbn)) erros.push(MENSAGENS.ISBN_OBRIGATORIO);

    if (campoVazio(this.anoPublicacao)) {
      erros.push(MENSAGENS.ANO_OBRIGATORIO);
    } else if (!Number.isInteger(this.anoPublicacao) || this.anoPublicacao <= 0) {
      erros.push(MENSAGENS.ANO_INVALIDO);
    }

    return erros;
  }

  // Valida, verifica ISBN duplicado e salva no repositório.
  cadastrarLivro(repositorio) {
    const erros = this.validarDados();
    if (erros.length > 0) {
      return { sucesso: false, mensagem: erros.join(' ') };
    }

    if (repositorio.existeIsbn(this.isbn)) {
      return { sucesso: false, mensagem: MENSAGENS.ISBN_DUPLICADO };
    }

    try {
      repositorio.salvar(this);
    } catch {
      return { sucesso: false, mensagem: MENSAGENS.ERRO_AO_SALVAR };
    }

    return { sucesso: true, mensagem: MENSAGENS.CADASTRO_SUCESSO };
  }
}
