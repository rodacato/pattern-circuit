// A single payment method and no other in sight: the fix is one line.
const VAT = 0.16

class Cashier {
  constructor(private barista: Barista) {}

  // region: Cashier#charge
  charge(order: Order) {
    const total = order.price * (1 + VAT)
    CardTerminal.charge(total)
    this.barista.prepare(order)
  }
  // endregion
}

// region: wiring
const cashier = new Cashier(new Barista(new Counter()))
new OrderTaker(cashier).take('latte', 50)
// endregion
