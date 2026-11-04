export class Livro {
  constructor(titulo, autor, isbn, anoPublicacao) {
    this.id = null;
    this.titulo = titulo;
    this.autor = autor;
    this.isbn = isbn;
    this.anoPublicacao = anoPublicacao;
  }

  validarDados() {
    const camposObrigatorios = [this.titulo, this.autor, this.isbn];
    const camposPreenchidos = camposObrigatorios.every(
      (campo) => typeof campo === 'string' && campo.trim().length > 0,
    );

    return camposPreenchidos
      && Number.isInteger(this.anoPublicacao)
      && this.anoPublicacao > 0;
  }
}

export default Livro;
