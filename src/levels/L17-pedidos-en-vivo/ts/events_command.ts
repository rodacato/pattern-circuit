// Cada evento del pedido es un comando: se encola y se puede retirar antes de ejecutarse.
class OrderEventCommand {
  constructor(private order: Order, private event: string, readonly id: number) {}
  execute() { this.order.handle(this.event) }
}

class FrontDesk {
  constructor(private queue: CommandQueue, private order: Order) {}

  // region: FrontDesk#submit
  submit(request: EventRequest) {
    if (request.undo) return this.queue.cancel(request.commandId)
    this.queue.push(new OrderEventCommand(this.order, request.event, request.commandId))
  }
  // endregion
}

class CommandQueue {
  private pending: OrderEventCommand[] = []

  // region: CommandQueue#push
  push(command: OrderEventCommand) { this.pending.push(command) }
  cancel(commandId: number) { this.pending = this.pending.filter((c) => c.id !== commandId) }
  runNext() { this.pending.shift()?.execute() }
  // endregion
}
