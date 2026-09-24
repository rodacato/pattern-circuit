class PaymentGateway
  # El proveedor está caído: cada cobro espera 30 segundos de timeout y falla.
  # region: PaymentGateway#charge
  def charge(order) = HTTP.timeout(30).post(PROVIDER_URL, json: order.payment) # Timeout::Error
  # endregion
end
