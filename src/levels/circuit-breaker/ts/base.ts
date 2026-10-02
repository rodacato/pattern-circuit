class PaymentGateway implements Gateway {
  // The provider is down: every charge waits 30 seconds for a timeout and fails.
  // region: PaymentGateway#charge
  charge(order: Order) { return HTTP.timeout(30).post(PROVIDER_URL, { json: order.payment }) } // TimeoutError
  // endregion
}
