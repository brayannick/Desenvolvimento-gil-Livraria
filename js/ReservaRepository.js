export default class ReservaRepository {
  constructor(armazenamento = new Map()) {
    this.armazenamento = armazenamento;
    this.idCounter = 1;
  }

  salvar(reserva) {
    const reservas = this.listarReservas();

    // Regra RN11: Uma reserva ATIVA por usuário e edição
    const jaExisteAtiva = reservas.some(
      r => r.usuarioId === reserva.usuarioId && 
           r.livroId === reserva.livroId && 
           r.status === 'ATIVA'
    );

    if (jaExisteAtiva) {
      throw new Error('Usuário já possui uma reserva ativa para esta edição.');
    }

    reserva.id = this.idCounter++;
    reservas.push(reserva);
    
    // Se estiver usando Map/localStorage customizado, atualiza
    if (typeof this.armazenamento.set === 'function') {
      this.armazenamento.set('reservas', JSON.stringify(reservas));
    }

    return { sucesso: true, mensagem: 'Reserva realizada com sucesso na fila de espera.' };
  }

  listarReservas() {
    if (typeof this.armazenamento.get === 'function' && this.armazenamento.get('reservas')) {
      return JSON.parse(this.armazenamento.get('reservas'));
    }
    if (Array.isArray(this.armazenamento)) {
      return this.armazenamento;
    }
    // Caso padrão em memória simples
    if (!this._memoriaInterna) {
      this._memoriaInterna = [];
    }
    return this._memoriaInterna;
  }

  obterFilaPorLivro(livroId) {
    const reservas = this.listarReservas();
    return reservas
      .filter(r => r.livroId === livroId && r.status === 'ATIVA')
      .sort((a, b) => new Date(a.dataSolicitacao) - new Date(b.dataSolicitacao)); // Ordem de chegada
  }
}
