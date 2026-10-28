class TicketCounter:
    _instance = None

    # One single instance for the whole coffee shop: even TicketCounter() hands back the same one.
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._last = 0
        return cls._instance

    @classmethod
    def instance(cls):
        return cls()

    # region: TicketCounter#next
    def next(self):
        self._last += 1
        return self._last
    # endregion


class Register:
    def __init__(self, display):
        self.display = display

    # Solves the problem… at the cost of any class being able to reach the global counter.
    # region: Register#checkout
    def checkout(self, order):
        order.ticket = TicketCounter.instance().next()
        self.display.show(order)
    # endregion
