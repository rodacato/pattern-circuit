class Cashier {
  constructor(private barista: Barista) {}

  // Every new payment method forces us to open this class again.
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
    // region: Cashier#charge:app
    } else if (order.payment === 'app') { // ← new: Cashier modified
      AppWallet.charge(order.total)
    // endregion
    // region: Cashier#charge:else
    } else {
      return // vouchers are still being lost
    // endregion
    }
    this.barista.prepare(order)
  }
  // endregion
}
