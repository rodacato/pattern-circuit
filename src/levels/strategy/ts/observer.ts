interface PaymentMethod {
  charge(order: Order): void
}

class Cashier {
  private subscribers: PaymentMethod[] = []

  subscribe(paymentMethod: PaymentMethod) { this.subscribers.push(paymentMethod) }

  // Observer notifies everyone; here we had to pick one.
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
    CashDrawer.collect(order.total) // charges even though the customer paid by card
    this.barista.prepare(order)
  }
  // endregion
}

class CardPayment implements PaymentMethod {
  constructor(private barista: Barista) {}

  // region: CardPayment#charge
  charge(order: Order) {
    CardTerminal.charge(order.total) // ...and here it charges again
    this.barista.prepare(order)
  }
  // endregion
}

class VoucherPayment implements PaymentMethod {
  constructor(private barista: Barista) {}

  // region: VoucherPayment#charge
  charge(order: Order) {
    VoucherBook.redeem(order.total) // ...and again
    this.barista.prepare(order)
  }
  // endregion
}
