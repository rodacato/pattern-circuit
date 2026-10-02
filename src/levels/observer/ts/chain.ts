interface Handler {
  handle(order: Order): void
}

class Order {
  private status = 'pending'

  constructor(private handler: Handler) {}

  // In a chain, the first one that handles it keeps the notice: the others never find out.
  // region: Order#complete!
  complete() {
    this.status = 'ready'
    this.handler.handle(this)
  }
  // endregion
}
