# A single payment method and no other in sight: the fix is one line.
VAT = 0.16


class Cashier:
    def __init__(self, barista):
        self.barista = barista

    # region: Cashier#charge
    def charge(self, order):
        total = order.price * (1 + VAT)
        CardTerminal.charge(total)
        self.barista.prepare(order)
    # endregion


# region: wiring
cashier = Cashier(Barista(Counter()))
OrderTaker(cashier).take("latte", 50)
# endregion
