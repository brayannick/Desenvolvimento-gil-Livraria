const CHAVE = 'biblioteca:livros';

function normalizarIsbn(isbn) {
  return String(isbn).replace(/[-\s]/g, '');
}

// Usa o localStorage do navegador; se não existir, guarda só em memória.
function obterStorage() {
  try {
    if (globalThis.localStorage) return globalThis.localStorage;
  } catch {
    // acesso bloqueado pelo navegador
  }
  const dados = new Map();
  return {
    getItem: (chave) => (dados.has(chave) ? dados.get(chave) : null),
    setItem: (chave, valor) => dados.set(chave, String(valor)),
  };
}

export class LivroRepository {
  #storage;

  constructor(storage = obterStorage()) {
    this.#storage = storage;
  }

  listar() {
    try {
      const livros = JSON.parse(this.#storage.getItem(CHAVE));
      return Array.isArray(livros) ? livros : [];
    } catch {
      return [];
    }
  }

  existeIsbn(isbn) {
    const alvo = normalizarIsbn(isbn);
    return this.listar().some((livro) => normalizarIsbn(livro.isbn) === alvo);
  }

  // Grava o livro no storage e só então define o id no objeto recebido.
  salvar(livro) {
    const livros = this.listar();
    const id = livros.reduce((maior, item) => Math.max(maior, item.id), 0) + 1;

    livros.push({
      id,
      titulo: livro.titulo,
      autor: livro.autor,
      isbn: livro.isbn,
      anoPublicacao: livro.anoPublicacao,
    });
    this.#storage.setItem(CHAVE, JSON.stringify(livros));

    livro.id = id;
    return livro;
  }
}
