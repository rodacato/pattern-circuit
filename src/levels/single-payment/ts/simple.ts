// Un solo método de pago y ninguno más a la vista: el arreglo es una línea.
const IVA = 0.16

class Cashier {
  constructor(private barista: Barista) {}

  // region: Cashier#charge
  charge(order: Order) {
    const total = order.price * (1 + IVA)
    CardTerminal.charge(total)
    this.barista.prepare(order)
  }
  // endregion
}

// region: wiring
const cashier = new Cashier(new Barista(new Counter()))
new OrderTaker(cashier).take('latte', 50)
// endregion
