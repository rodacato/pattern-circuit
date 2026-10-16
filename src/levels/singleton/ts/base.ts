class TicketCounter {
  private last = 0

  // region: TicketCounter#next
  next() { return ++this.last }
  // endregion
}

class Register {
  private counter: TicketCounter

  constructor(private display: Display) {
    this.counter = new TicketCounter() // each register creates its own counter…
  }

  // …and the two registers hand out ticket 1, 2, 3… twice.
  // region: Register#checkout
  checkout(order: Order) {
    order.ticket = this.counter.next()
    this.display.show(order)
  }
  // endregion
}
