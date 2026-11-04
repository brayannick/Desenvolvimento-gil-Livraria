function normalizarIsbn(isbn) {
  return String(isbn).replace(/[-\s]/g, '');
}

function criarArmazenamentoEmMemoria() {
  const dados = new Map();
  return {
    getItem(chave) {
      return dados.get(chave) ?? null;
    },
    setItem(chave, valor) {
      dados.set(chave, String(valor));
    },
  };
}

const CHAVE_ARMAZENAMENTO = 'biblioteca.livros';

export class LivroRepository {
  #livros = [];
  #proximoId = 1;
  #armazenamento;

  constructor(armazenamento = criarArmazenamentoEmMemoria()) {
    this.#armazenamento = armazenamento;
    const dados = this.#armazenamento.getItem(CHAVE_ARMAZENAMENTO);
    if (dados !== null) {
      const estado = JSON.parse(dados);
      this.#livros = estado.livros;
      this.#proximoId = estado.proximoId;
    }
  }

  salvar(livro) {
    const id = this.#proximoId;
    const livros = [...this.#livros, { ...livro, id }];
    this.#armazenamento.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify({
      livros,
      proximoId: id + 1,
    }));

    livro.id = id;
    this.#proximoId = id + 1;
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
