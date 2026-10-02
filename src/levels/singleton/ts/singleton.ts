class TicketCounter {
  private static _instance?: TicketCounter

  // One single instance for the whole coffee shop.
  static get instance() { return (this._instance ??= new TicketCounter()) }
  private constructor() {}

  private last = 0

  // region: TicketCounter#next
  next() { return ++this.last }
  // endregion
}

class Register {
  constructor(private display: Display) {}

  // Solves the problem… at the cost of any class being able to reach the global counter.
  // region: Register#checkout
  checkout(order: Order) {
    order.ticket = TicketCounter.instance.next()
    this.display.show(order)
  }
  // endregion
}
