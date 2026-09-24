class PaymentGateway implements Gateway {
  // region: PaymentGateway#charge
  charge(order: Order) { return HTTP.timeout(30).post(PROVIDER_URL, { json: order.payment }) }
  // endregion
}

// Intentar el proveedor y, si falla, pasar al siguiente: nadie se queda sin cobrar…
// pero cada cliente espera el timeout completo, porque la cadena nunca deja de intentarlo.
// region: FallbackChain#charge
class FallbackChain implements Gateway {
  charge(order: Order) {
    try {
      return new PaymentGateway().charge(order)
    } catch (error) {
      if (!(error instanceof TimeoutError)) throw error
      return new OfflinePayments().charge(order)
    }
  }
}
// endregion
