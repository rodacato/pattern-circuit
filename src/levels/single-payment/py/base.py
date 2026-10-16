# The airport only accepts cards, and it will stay that way: the contract with the bank runs for years.
VAT = 0.16


class Cashier:
    def __init__(self, barista):
        self.barista = barista

    # region: Cashier#charge
    def charge(self, order):
        total = order.price * (1 + VAT)
        total *= 1 + VAT  # ← bug: VAT is added twice
        CardTerminal.charge(total)
        self.barista.prepare(order)
    # endregion


# region: wiring
cashier = Cashier(Barista(Counter()))
OrderTaker(cashier).take("latte", 50)
# endregion
