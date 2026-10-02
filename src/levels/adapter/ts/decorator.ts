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
    this.gateway.charge(order.total) // sigue sin existir charge() en el SDK envuelto
    this.barista.prepare(order)
  }
  // endregion
}

// Envuelve y añade logs… pero delega la misma llamada que el SDK no entiende.
// region: LoggedGateway
class LoggedGateway implements PaymentGateway {
  constructor(private inner: PaymentGateway) {}

  charge(total: number) {
    console.log(`cobrando ${total}`)
    this.inner.charge(total)
  }
}
// endregion
