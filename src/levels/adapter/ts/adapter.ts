interface PaymentGateway {
  charge(total: number): void
}

class Cashier {
  constructor(
    private gateway: PaymentGateway,
    private barista: Barista,
  ) {}

  // Cashier no cambió: sigue hablando su idioma.
  // region: Cashier#charge
  charge(order: Order) {
    this.gateway.charge(order.total)
    this.barista.prepare(order)
  }
  // endregion
}

// Traduce la interfaz que Cashier espera a la que el SDK ofrece.
// region: PagoFacilAdapter#charge
class PagoFacilAdapter implements PaymentGateway {
  constructor(private sdk: PagoFacil.SDK) {}

  charge(total: number) {
    this.sdk.cobrarEnCentavos({ montoCentavos: Math.round(total * 100), referencia: crypto.randomUUID() })
  }
}
// endregion
