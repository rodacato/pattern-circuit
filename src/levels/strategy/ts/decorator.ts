// Wraps the order and adds something, but decides nothing.
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
    const order = new TrackedOrder(plain) // the order arrives wrapped…
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
      return // …but it falls into the same if tree
    // endregion
    }
    this.barista.prepare(order)
  }
  // endregion
}
