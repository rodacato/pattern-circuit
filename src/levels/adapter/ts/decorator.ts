interface PaymentGateway {
  charge(total: number): void
}

class Cashier {
  private gateway: PaymentGateway

  constructor(
    gateway: PaymentGateway,
    private barista: Barista,
  ) {
    this.gateway = new LoggedGateway(gateway)
  }

  // region: Cashier#charge
  charge(order: Order) {
    this.gateway.charge(order.total) // charge() still does not exist on the wrapped SDK
    this.barista.prepare(order)
  }
  // endregion
}

// Wraps and adds logs… but delegates the same call the SDK does not understand.
// region: LoggedGateway
class LoggedGateway implements PaymentGateway {
  constructor(private inner: PaymentGateway) {}

  charge(total: number) {
    console.log(`charging ${total}`)
    this.inner.charge(total)
  }
}
// endregion
