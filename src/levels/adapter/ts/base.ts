interface PaymentGateway {
  charge(total: number): void
}

class Cashier {
  constructor(
    private gateway: PaymentGateway, // ahora es PagoFacil.SDK
    private barista: Barista,
  ) {}

  // Cashier habla "charge(total)"; el SDK entiende "cobrarEnCentavos". No encajan.
  // region: Cashier#charge
  charge(order: Order) {
    this.gateway.charge(order.total) // TypeError: PagoFacil.SDK no tiene charge()
    this.barista.prepare(order)
  }
  // endregion
}
