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
  // The register picks a numbering strategy… and each strategy keeps its own count.
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
