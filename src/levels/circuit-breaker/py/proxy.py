
# A proxy in front of the provider… that forwards every charge to it and waits for the same timeout.
# region: GatewayProxy
class GatewayProxy:
    def charge(self, order):
        return PaymentGateway().charge(order)
# endregion
