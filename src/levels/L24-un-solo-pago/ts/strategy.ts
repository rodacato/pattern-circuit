// Strategy "por si acaso": una interfaz, un registro… y una sola implementación.
const IVA = 0.16

interface PaymentMethod {
  charge(total: number): void
}

class Cashier {
  constructor(
    private barista: Barista,
    private methods: Record<string, PaymentMethod>,
  ) {}

  // region: Cashier#charge
  charge(order: Order) {
    this.methods['card'].charge(order.price * (1 + IVA))
    this.barista.prepare(order)
  }
  // endregion
}

// region: CardPayment#charge
class CardPayment implements PaymentMethod {
  charge(total: number) { CardTerminal.charge(total) }
}
// endregion

// region: wiring
const cashier = new Cashier(new Barista(new Counter()), { card: new CardPayment() })
new OrderTaker(cashier).take('latte', 50)
// endregion
