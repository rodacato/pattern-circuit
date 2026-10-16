# --- the rest of the coffee shop ---
class Cashier:
    def __init__(self, barista):
        self.barista = barista

    # region: Cashier#charge
    def charge(self, order):
        CardTerminal.charge(order.total)
        self.barista.prepare(order)
    # endregion


class Barista:
    def __init__(self, counter):
        self.counter = counter

    # The kitchen is the last place to find out an order was impossible: it was already charged.
    # region: Barista#prepare
    def prepare(self, order):
        if order.is_hot() and order.is_iced():
            raise RuntimeError("Ice in a boiling drink?")
        self.counter.hand_over(order)
    # endregion


class Counter:
    # region: Counter#hand_over
    def hand_over(self, order):
        print(f"{order.name} ready!")
    # endregion

    # region: Counter#notify
    def notify(self, message):
        print(f"Before charging: {message}")
    # endregion
