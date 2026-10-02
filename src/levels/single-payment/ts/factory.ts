// Factory Method para crear un único tipo de pago: una jerarquía de creadores con un solo producto.
const IVA = 0.16

class PaymentFactory {
  // region: PaymentFactory#create
  create() { return new CardPayment() }
  // endregion
}

class CardPayment {
  charge(total: number) { CardTerminal.charge(total) }
}

class Cashier {
  constructor(
    private barista: Barista,
    private factory: PaymentFactory,
  ) {}

  // region: Cashier#charge
  charge(order: Order) {
    this.factory.create().charge(order.price * (1 + IVA))
    this.barista.prepare(order)
  }
  // endregion
}

// region: wiring
const cashier = new Cashier(new Barista(new Counter()), new PaymentFactory())
new OrderTaker(cashier).take('latte', 50)
// endregion
