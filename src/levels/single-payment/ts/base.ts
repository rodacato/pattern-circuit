// El aeropuerto solo acepta tarjeta, y así seguirá: el contrato con el banco es por años.
const IVA = 0.16

class Cashier {
  constructor(private barista: Barista) {}

  // region: Cashier#charge
  charge(order: Order) {
    let total = order.price * (1 + IVA)
    total *= 1 + IVA // ← bug: el IVA se suma dos veces
    CardTerminal.charge(total)
    this.barista.prepare(order)
  }
  // endregion
}

// region: wiring
const cashier = new Cashier(new Barista(new Counter()))
new OrderTaker(cashier).take('latte', 50)
// endregion
