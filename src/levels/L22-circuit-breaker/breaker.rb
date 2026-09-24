class PaymentGateway
  # region: PaymentGateway#charge
  def charge(order) = HTTP.timeout(30).post(PROVIDER_URL, json: order.payment)
  # endregion
end

# Después de varios fallos seguidos deja de llamar al proveedor y va directo al respaldo.
class CircuitBreaker
  def initialize(service, fallback, threshold: 2)
    @service, @fallback, @threshold = service, fallback, threshold
    @failures = 0
  end

  # region: CircuitBreaker#charge
  def charge(order)
    return @fallback.charge(order) if open?
    @service.charge(order)
  rescue Timeout::Error
    @failures += 1
    @fallback.charge(order)
  end
  # endregion

  def open? = @failures >= @threshold # (tras un tiempo, un intento de prueba lo cerraría: "half-open")
end

# region: Timeout::Error
# El fallo vuelve al interruptor, que lo cuenta.
# endregion
