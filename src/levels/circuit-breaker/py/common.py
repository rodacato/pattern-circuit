# --- the rest of the coffee shop ---
class Cashier:
    def __init__(self, gateway):
        self.gateway = gateway

    # region: Cashier#charge
    def charge(self, order):
        return self.gateway.charge(order)
    # endregion


class OfflinePayments:
    def __init__(self):
        self.pending = []

    # Fallback: records the charge and processes it when the provider is back.
    # region: OfflinePayments#charge
    def charge(self, order):
        self.pending.append(order)
    # endregion


class Barista:
    def __init__(self, counter):
        self.counter = counter

    # region: Barista#prepare
    def prepare(self, order):
        self.counter.hand_over(order)
    # endregion


class Counter:
    # region: Counter#hand_over
    def hand_over(self, order):
        print("Ready!")
    # endregion
