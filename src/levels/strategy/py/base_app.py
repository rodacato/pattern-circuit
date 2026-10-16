class Cashier:
    def __init__(self, barista):
        self.barista = barista

    # Every new payment method forces us to open this class again.
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
        # region: Cashier#charge:app
        elif order.payment == "app":  # ← new: Cashier modified
            AppWallet.charge(order.total)
        # endregion
        # region: Cashier#charge:else
        else:
            return  # vouchers are still being lost
        # endregion
        self.barista.prepare(order)
    # endregion
