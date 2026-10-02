interface Numbering {
  next(): number
}

class TicketCounter implements Numbering {
  private last = 0

  // region: TicketCounter#next
  next() { return ++this.last }
  // endregion
}

class Register {
  // La caja elige una estrategia de numeración… y cada estrategia lleva su propia cuenta.
  constructor(
    private display: Display,
    private numbering: Numbering = new TicketCounter(),
  ) {}

  // region: Register#checkout
  checkout(order: Order) {
    order.ticket = this.numbering.next()
    this.display.show(order)
  }
  // endregion
}
