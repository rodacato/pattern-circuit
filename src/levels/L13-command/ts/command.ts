// Un pedido convertido en objeto: se puede guardar, encolar, ejecutar después… o deshacer.
class OrderCommand {
  constructor(private barista: Barista, private drink: string, readonly orderId: number) {}
  execute() { this.barista.prepare(this.drink) }
}

class FrontDesk {
  constructor(private barista: Barista, private queue: CommandQueue) {}

  // region: FrontDesk#submit
  submit(request: OrderRequest) {
    if (request.action === 'cancelar') return this.queue.cancel(request.orderId)
    this.queue.push(new OrderCommand(this.barista, request.drink, request.orderId))
  }
  // endregion
}

class CommandQueue {
  private pending: OrderCommand[] = []

  // Los comandos esperan su turno; deshacer es sacarlos de la cola antes de que corran.
  // region: CommandQueue#push
  push(command: OrderCommand) { this.pending.push(command) }
  cancel(orderId: number) { this.pending = this.pending.filter((c) => c.orderId !== orderId) }
  runNext() { this.pending.shift()?.execute() }
  // endregion
}
