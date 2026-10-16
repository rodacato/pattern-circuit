class TicketCounter:
    def __init__(self):
        self._last = 0

    # region: TicketCounter#next
    def next(self):
        self._last += 1
        return self._last
    # endregion


class Register:
    # The register picks a numbering strategy… and each strategy keeps its own count.
    def __init__(self, display, numbering=None):
        self.display = display
        self.numbering = numbering or TicketCounter()

    # region: Register#checkout
    def checkout(self, order):
        order.ticket = self.numbering.next()
        self.display.show(order)
    # endregion
