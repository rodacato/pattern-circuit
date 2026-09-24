// Envuelve el pedido y le añade algo, pero no decide nada.
// region: TrackedOrder
class TrackedOrder implements Order {
  constructor(private inner: Order) {}
  get drink() { return this.inner.drink }
  get payment() { return this.inner.payment }
  get total() { return this.inner.total }
  get trackingId() { return `T-${Math.random().toString(36).slice(2)}` }
}
// endregion

class Cashier {
  constructor(private barista: Barista) {}

  // region: Cashier#charge
  charge(plain: Order) {
    const order = new TrackedOrder(plain) // el pedido llega envuelto…
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
      return // …pero cae en el mismo árbol de if
    // endregion
    }
    this.barista.prepare(order)
  }
  // endregion
}
