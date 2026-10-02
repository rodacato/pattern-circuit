// The airport only accepts cards, and it will stay that way: the contract with the bank runs for years.
const VAT = 0.16

class Cashier {
  constructor(private barista: Barista) {}

  // region: Cashier#charge
  charge(order: Order) {
    let total = order.price * (1 + VAT)
    total *= 1 + VAT // ← bug: VAT is added twice
    CardTerminal.charge(total)
    this.barista.prepare(order)
  }
  // endregion
}

// region: wiring
const cashier = new Cashier(new Barista(new Counter()))
new OrderTaker(cashier).take('latte', 50)
// endregion
