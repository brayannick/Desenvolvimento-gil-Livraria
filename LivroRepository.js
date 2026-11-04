function normalizarIsbn(isbn) {
  return String(isbn).replace(/[-\s]/g, '');
}

export class LivroRepository {
  #livros = [];
  #proximoId = 1;

  salvar(livro) {
    livro.id = this.#proximoId++;
    this.#livros.push(livro);
    return livro;
  }

  existeIsbn(isbn) {
    const alvo = normalizarIsbn(isbn);
    return this.#livros.some((livro) => normalizarIsbn(livro.isbn) === alvo);
  }

  listar() {
    return [...this.#livros];
  }
}
