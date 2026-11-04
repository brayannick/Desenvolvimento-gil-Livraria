export class LivroRepository {
  #livros = [];
  #proximoId = 1;

  salvar(livro) {
    livro.id = this.#proximoId++;
    this.#livros.push(livro);
    return livro;
  }

  existeIsbn(isbn) {
    const alvo = String(isbn).trim();
    return this.#livros.some((livro) => String(livro.isbn).trim() === alvo);
  }

  listar() {
    return [...this.#livros];
  }
}
