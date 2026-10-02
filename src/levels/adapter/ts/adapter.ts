interface PaymentGateway {
  charge(total: number): void
}

class Cashier {
  constructor(
    private gateway: PaymentGateway,
    private barista: Barista,
  ) {}

  // Cashier did not change: it still speaks its own language.
  // region: Cashier#charge
  charge(order: Order) {
    this.gateway.charge(order.total)
    this.barista.prepare(order)
  }
  // endregion
}

// Translates the interface Cashier expects into the one the SDK offers.
// region: PagoFacilAdapter#charge
class PagoFacilAdapter implements PaymentGateway {
  constructor(private sdk: PagoFacil.SDK) {}

  charge(total: number) {
    this.sdk.chargeInCents({ amountCents: Math.round(total * 100), reference: crypto.randomUUID() })
  }
}
// endregion
