class Cashier {
  constructor(
    private payments: Payments,
    private barista: Barista,
  ) {}

  // region: Cashier#charge
  charge(order: Order) {
    this.payments.charge(order.total)
    this.barista.prepare(order)
  }
  // endregion
}

// Una fachada simplifica un subsistema, pero no traduce: sigue pidiendo charge().
// region: Payments#charge
class Payments {
  constructor(private sdk: PaymentGateway) {}
  charge(total: number) { this.sdk.charge(total) }
}
// endregion
