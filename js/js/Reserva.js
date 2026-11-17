export default class Reserva {
  constructor(usuarioId, livroId) {
    this.id = null;
    this.usuarioId = usuarioId;
    this.livroId = livroId;
    this.status = 'ATIVA'; // ATIVA, ATENDIDA ou CANCELADA
    this.dataSolicitacao = new Date();
  }

  validarDados() {
    const erros = [];
    if (!this.usuarioId || this.usuarioId.trim() === '') {
      erros.push('O ID do usuário é obrigatório.');
    }
    if (!this.livroId || this.livroId.trim() === '') {
      erros.push('O ID do livro/edição é obrigatório.');
    }
    return erros;
  }

  salvarReserva(repositorio) {
    const erros = this.validarDados();
    if (erros.length > 0) {
      return { sucesso: false, mensagem: erros.join(' ') };
    }

    try {
      return repositorio.salvar(this);
    } catch (erro) {
      return { sucesso: false, mensagem: erro.message };
    }
  }
}
