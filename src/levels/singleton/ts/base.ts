class TicketCounter {
  private last = 0

  // region: TicketCounter#next
  next() { return ++this.last }
  // endregion
}

class Register {
  private counter: TicketCounter

  constructor(private display: Display) {
    this.counter = new TicketCounter() // cada caja crea su propio contador…
  }

  // …y las dos cajas reparten el turno 1, el 2, el 3… dos veces.
  // region: Register#checkout
  checkout(order: Order) {
    order.ticket = this.counter.next()
    this.display.show(order)
  }
  // endregion
}
