class Cashier:
    def __init__(self, payments, barista):
        self.payments = payments
        self.barista = barista

    # region: Cashier#charge
    def charge(self, order):
        self.payments.charge(order.total)
        self.barista.prepare(order)
    # endregion


# A facade simplifies a subsystem, but it does not translate: it still asks for charge().
# region: Payments#charge
class Payments:
    def __init__(self, sdk):
        self.sdk = sdk

    def charge(self, total):
        self.sdk.charge(total)
# endregion
