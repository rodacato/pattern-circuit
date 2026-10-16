class PaymentGateway:
    # region: PaymentGateway#charge
    def charge(self, order):
        return HTTP.timeout(30).post(PROVIDER_URL, json=order.payment)
    # endregion


# After several consecutive failures it stops calling the provider and goes straight to the fallback.
class CircuitBreaker:
    def __init__(self, service, fallback, threshold=2):
        self.service = service
        self.fallback = fallback
        self.threshold = threshold
        self.failures = 0

    # region: CircuitBreaker#charge
    def charge(self, order):
        if self.is_open():
            return self.fallback.charge(order)
        try:
            result = self.service.charge(order)
            self.failures = 0  # a success resets the count: what opens the circuit is consecutive failures
            return result
        except TimeoutError:
            self.failures += 1
            return self.fallback.charge(order)
    # endregion

    def is_open(self):
        return self.failures >= self.threshold  # (after a while, a trial attempt would close it: "half-open")


# region: Timeout::Error
# The failure comes back to the breaker, which counts it.
# endregion
