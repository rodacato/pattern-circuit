// One strategy per event… but none remembers which state the order is in.
class Order {
  status = 'pending'
  private history = new History()

  static HANDLERS: Record<string, new () => { apply(): string }> = {
    pay: PayHandler, prepare: PrepareHandler, deliver: DeliverHandler, cancel: CancelHandler,
  }

  // region: EventHandlers
  handle(event: string) {
    this.status = new Order.HANDLERS[event]().apply() // always applies, no matter what
    this.history.record(this, event)
  }
  // endregion
}
