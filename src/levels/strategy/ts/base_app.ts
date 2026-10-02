class Cashier {
  constructor(private barista: Barista) {}

  // Cada método de pago nuevo obliga a abrir esta clase otra vez.
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
    } else if (order.payment === 'app') { // ← nuevo: Cashier modificado
      AppWallet.charge(order.total)
    // endregion
    // region: Cashier#charge:else
    } else {
      return // los vales siguen perdiéndose
    // endregion
    }
    this.barista.prepare(order)
  }
  // endregion
}
