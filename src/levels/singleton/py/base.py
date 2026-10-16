class TicketCounter:
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
        self.counter = TicketCounter()  # each register creates its own counter…

    # …and the two registers hand out ticket 1, 2, 3… twice.
    # region: Register#checkout
    def checkout(self, order):
        order.ticket = self.counter.next()
        self.display.show(order)
    # endregion
