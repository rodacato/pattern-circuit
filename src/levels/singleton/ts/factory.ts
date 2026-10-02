class CounterFactory {
  // region: CounterFactory#create
  create() { return new TicketCounter() } // a new counter on every order: always ticket 1
  // endregion
}

class TicketCounter {
  private last = 0
  next() { return ++this.last }
}

class Register {
  constructor(private display: Display) {}

  // region: Register#checkout
  checkout(order: Order) {
    order.ticket = new CounterFactory().create().next()
    this.display.show(order)
  }
  // endregion
}
