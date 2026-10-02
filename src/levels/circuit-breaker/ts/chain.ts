class PaymentGateway implements Gateway {
  // region: PaymentGateway#charge
  charge(order: Order) { return HTTP.timeout(30).post(PROVIDER_URL, { json: order.payment }) }
  // endregion
}

// Try the provider and, if it fails, move on to the next one: nobody goes uncharged…
// but every customer waits the full timeout, because the chain never stops trying.
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
