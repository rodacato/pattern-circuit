class Cashier:
    def __init__(self, barista):
        self.barista = barista

    # region: Cashier#charge
    def charge(self, order):
        # region: Cashier#charge:cash
        if order.payment == "cash":
            CashDrawer.collect(order.total)
        # endregion
        # region: Cashier#charge:card
        elif order.payment == "card":
            CardTerminal.charge(order.total)
        # endregion
        # region: Cashier#charge:else
        else:
            # vouchers? Nobody planned for them: the order is lost silently.
            return
        # endregion
        self.barista.prepare(order)
    # endregion
