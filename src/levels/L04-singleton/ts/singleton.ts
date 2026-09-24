class TicketCounter {
  private static _instance?: TicketCounter

  // Una sola instancia para toda la cafetería.
  static get instance() { return (this._instance ??= new TicketCounter()) }
  private constructor() {}

  private last = 0

  // region: TicketCounter#next
  next() { return ++this.last }
  // endregion
}

class Register {
  constructor(private display: Display) {}

  // Resuelve el problema… a costa de que cualquier clase pueda llegar al contador global.
  // region: Register#checkout
  checkout(order: Order) {
    order.ticket = TicketCounter.instance.next()
    this.display.show(order)
  }
  // endregion
}
