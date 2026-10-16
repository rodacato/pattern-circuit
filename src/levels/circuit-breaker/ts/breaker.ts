class PaymentGateway implements Gateway {
  // region: PaymentGateway#charge
  charge(order: Order) { return HTTP.timeout(30).post(PROVIDER_URL, { json: order.payment }) }
  // endregion
}

// After several consecutive failures it stops calling the provider and goes straight to the fallback.
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
      this.failures = 0 // a success resets the count: what opens the circuit is consecutive failures
      return result
    } catch (error) {
      if (!(error instanceof TimeoutError)) throw error
      this.failures += 1
      return this.fallback.charge(order)
    }
  }
  // endregion

  isOpen() { return this.failures >= this.threshold } // (after a while, a trial attempt would close it: "half-open")
}

// region: Timeout::Error
// The failure comes back to the breaker, which counts it.
// endregion
