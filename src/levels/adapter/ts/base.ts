interface PaymentGateway {
  charge(total: number): void
}

class Cashier {
  constructor(
    private gateway: PaymentGateway, // now it is PagoFacil.SDK
    private barista: Barista,
  ) {}

  // Cashier speaks "charge(total)"; the SDK understands "chargeInCents". They do not fit.
  // region: Cashier#charge
  charge(order: Order) {
    this.gateway.charge(order.total) // TypeError: PagoFacil.SDK has no charge()
    this.barista.prepare(order)
  }
  // endregion
}
