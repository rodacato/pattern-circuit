class CounterFactory:
    # region: CounterFactory#create
    def create(self):
        return TicketCounter()  # a new counter on every order: always ticket 1
    # endregion


class TicketCounter:
    def __init__(self):
        self._last = 0

    def next(self):
        self._last += 1
        return self._last


class Register:
    def __init__(self, display):
        self.display = display

    # region: Register#checkout
    def checkout(self, order):
        order.ticket = CounterFactory().create().next()
        self.display.show(order)
    # endregion
