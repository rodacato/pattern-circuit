class Cashier {
  constructor(private barista: Barista) {}

  // region: Cashier#charge
  charge(order: Order) {
    // region: Cashier#charge:cash
    if (order.payment === 'cash') {
      CashDrawer.collect(order.total)
    // endregion
    // region: Cashier#charge:card
    } else if (order.payment === 'card') {
      CardTerminal.charge(order.total)
    // endregion
    // region: Cashier#charge:else
    } else {
      // ¿vales? Nadie los contempló: el pedido se pierde en silencio.
      return
    // endregion
    }
    this.barista.prepare(order)
  }
  // endregion
}
