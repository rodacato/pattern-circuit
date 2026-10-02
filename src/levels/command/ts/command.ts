// An order turned into an object: it can be saved, queued, run later… or undone.
class OrderCommand {
  constructor(private barista: Barista, private drink: string, readonly orderId: number) {}
  execute() { this.barista.prepare(this.drink) }
}

class FrontDesk {
  constructor(private barista: Barista, private queue: CommandQueue) {}

  // region: FrontDesk#submit
  submit(request: OrderRequest) {
    if (request.action === 'cancel') return this.queue.cancel(request.orderId)
    this.queue.push(new OrderCommand(this.barista, request.drink, request.orderId))
  }
  // endregion
}

class CommandQueue {
  private pending: OrderCommand[] = []

  // Commands wait their turn; undoing is taking them out of the queue before they run.
  // region: CommandQueue#push
  push(command: OrderCommand) { this.pending.push(command) }
  cancel(orderId: number) { this.pending = this.pending.filter((c) => c.orderId !== orderId) }
  runNext() { this.pending.shift()?.execute() }
  // endregion
}
