class PaymentGateway implements Gateway {
  // El proveedor está caído: cada cobro espera 30 segundos de timeout y falla.
  // region: PaymentGateway#charge
  charge(order: Order) { return HTTP.timeout(30).post(PROVIDER_URL, { json: order.payment }) } // TimeoutError
  // endregion
}
