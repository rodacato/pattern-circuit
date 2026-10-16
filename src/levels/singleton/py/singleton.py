class TicketCounter:
    _instance = None

    # One single instance for the whole coffee shop.
    @classmethod
    def instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        self._last = 0

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
