class PaymentGateway
  # region: PaymentGateway#charge
  def charge(order) = HTTP.timeout(30).post(PROVIDER_URL, json: order.payment)
  # endregion
end

# After several consecutive failures it stops calling the provider and goes straight to the fallback.
class CircuitBreaker
  def initialize(service, fallback, threshold: 2)
    @service, @fallback, @threshold = service, fallback, threshold
    @failures = 0
  end

  # region: CircuitBreaker#charge
  def charge(order)
    return @fallback.charge(order) if open?
    result = @service.charge(order)
    @failures = 0 # a success resets the count: what opens the circuit is consecutive failures
    result
  rescue Timeout::Error
    @failures += 1
    @fallback.charge(order)
  end
  # endregion

  def open? = @failures >= @threshold # (after a while, a trial attempt would close it: "half-open")
end

# region: Timeout::Error
# The failure comes back to the breaker, which counts it.
# endregion
