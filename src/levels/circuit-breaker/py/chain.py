class PaymentGateway:
    # region: PaymentGateway#charge
    def charge(self, order):
        return HTTP.timeout(30).post(PROVIDER_URL, json=order.payment)
    # endregion


# Try the provider and, if it fails, move on to the next one: nobody goes uncharged…
# but every customer waits the full timeout, because the chain never stops trying.
# region: FallbackChain#charge
class FallbackChain:
    def charge(self, order):
        try:
            return PaymentGateway().charge(order)
        except TimeoutError:
            return OfflinePayments().charge(order)
# endregion
