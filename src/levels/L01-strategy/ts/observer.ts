interface PaymentMethod {
  charge(order: Order): void
}

class Cashier {
  private subscribers: PaymentMethod[] = []

  subscribe(paymentMethod: PaymentMethod) { this.subscribers.push(paymentMethod) }

  // Observer avisa a todos; aquí había que elegir a uno.
  // region: Cashier#charge
  charge(order: Order) {
    this.subscribers.forEach((s) => s.charge(order))
  }
  // endregion
}

class CashPayment implements PaymentMethod {
  constructor(private barista: Barista) {}

  // region: CashPayment#charge
  charge(order: Order) {
    CashDrawer.collect(order.total) // cobra aunque el cliente pagó con tarjeta
    this.barista.prepare(order)
  }
  // endregion
}

class CardPayment implements PaymentMethod {
  constructor(private barista: Barista) {}

  // region: CardPayment#charge
  charge(order: Order) {
    CardTerminal.charge(order.total) // ...y aquí se vuelve a cobrar
    this.barista.prepare(order)
  }
  // endregion
}

class VoucherPayment implements PaymentMethod {
  constructor(private barista: Barista) {}

  // region: VoucherPayment#charge
  charge(order: Order) {
    VoucherBook.redeem(order.total) // ...y otra vez
    this.barista.prepare(order)
  }
  // endregion
}
