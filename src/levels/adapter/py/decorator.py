class Cashier:
    def __init__(self, gateway, barista):
        self.gateway = LoggedGateway(gateway)
        self.barista = barista

    # region: Cashier#charge
    def charge(self, order):
        self.gateway.charge(order.total)  # charge() still does not exist on the wrapped SDK
        self.barista.prepare(order)
    # endregion


# Wraps and adds logs… but delegates the same call the SDK does not understand.
# region: LoggedGateway
class LoggedGateway:
    def __init__(self, inner):
        self.inner = inner

    def charge(self, total):
        print(f"charging {total}")
        self.inner.charge(total)
# endregion
