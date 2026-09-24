class PaymentGateway
  # region: PaymentGateway#charge
  def charge(order) = HTTP.timeout(30).post(PROVIDER_URL, json: order.payment)
  # endregion
end

# Intentar el proveedor y, si falla, pasar al siguiente: nadie se queda sin cobrar…
# pero cada cliente espera el timeout completo, porque la cadena nunca deja de intentarlo.
# region: FallbackChain#charge
class FallbackChain
  def charge(order)
    PaymentGateway.new.charge(order)
  rescue Timeout::Error
    OfflinePayments.new.charge(order)
  end
end
# endregion
