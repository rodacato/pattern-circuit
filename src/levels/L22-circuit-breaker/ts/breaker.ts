class PaymentGateway implements Gateway {
  // region: PaymentGateway#charge
  charge(order: Order) { return HTTP.timeout(30).post(PROVIDER_URL, { json: order.payment }) }
  // endregion
}

// Después de varios fallos seguidos deja de llamar al proveedor y va directo al respaldo.
class CircuitBreaker implements Gateway {
  private failures = 0

  constructor(
    private service: Gateway,
    private fallback: Gateway,
    private threshold = 2,
  ) {}

  // region: CircuitBreaker#charge
  charge(order: Order) {
    if (this.isOpen()) return this.fallback.charge(order)
    try {
      const result = this.service.charge(order)
      this.failures = 0 // un éxito reinicia la cuenta: lo que abre el circuito son fallos seguidos
      return result
    } catch (error) {
      if (!(error instanceof TimeoutError)) throw error
      this.failures += 1
      return this.fallback.charge(order)
    }
  }
  // endregion

  isOpen() { return this.failures >= this.threshold } // (tras un tiempo, un intento de prueba lo cerraría: "half-open")
}

// region: Timeout::Error
// El fallo vuelve al interruptor, que lo cuenta.
// endregion
