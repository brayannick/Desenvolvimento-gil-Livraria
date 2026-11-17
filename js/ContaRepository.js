const CHAVE = 'biblioteca.contas';
const SESSAO = 'biblioteca.sessao';

async function derivarSenha(senha, sal) {
  const chave = await crypto.subtle.importKey('raw', new TextEncoder().encode(senha), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(sal), iterations: 100000, hash: 'SHA-256' }, chave, 256);
  return Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2, '0')).join('');
}

export class ContaRepository {
  constructor(storage) {
    this.storage = storage;
  }

  listar() {
    const contas = JSON.parse(this.storage.getItem(CHAVE) ?? '[]');
    if (!Array.isArray(contas) || contas.some(conta => !conta ||
      typeof conta.nome !== 'string' || typeof conta.email !== 'string' ||
      typeof conta.sal !== 'string' || !/^[a-f0-9]{64}$/.test(conta.hash))) {
      throw new Error('Dados de contas inválidos no armazenamento.');
    }
    return contas;
  }

  async cadastrar(nome, email, senha) {
    nome = nome.trim();
    email = email.trim().toLowerCase();
    if (!nome || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || senha.length < 8) {
      throw new Error('Informe nome, e-mail válido e senha com pelo menos 8 caracteres.');
    }
    const sal = crypto.randomUUID();
    const hash = await derivarSenha(senha, sal);
    const contas = this.listar();
    if (contas.some(conta => conta.email === email)) throw new Error('Já existe uma conta com este e-mail.');
    this.storage.setItem(CHAVE, JSON.stringify([...contas, { nome, email, sal, hash }]));
  }

  async entrar(email, senha) {
    const conta = this.listar().find(conta => conta.email === email.trim().toLowerCase());
    if (!conta || await derivarSenha(senha, conta.sal) !== conta.hash) {
      throw new Error('E-mail ou senha incorretos.');
    }
    const usuario = { nome: conta.nome, email: conta.email };
    this.storage.setItem(SESSAO, JSON.stringify(usuario));
    return usuario;
  }

  sessao() {
    const usuario = JSON.parse(this.storage.getItem(SESSAO) ?? 'null');
    if (usuario !== null && (typeof usuario.nome !== 'string' || typeof usuario.email !== 'string')) {
      throw new Error('Sessão inválida no armazenamento.');
    }
    return usuario;
  }

  sair() {
    this.storage.removeItem(SESSAO);
  }
}
