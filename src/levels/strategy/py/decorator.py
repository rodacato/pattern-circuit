# Wraps the order and adds something, but decides nothing.
# region: TrackedOrder
class TrackedOrder:
    def __init__(self, inner):
        self.inner = inner

    def __getattr__(self, name):
        return getattr(self.inner, name)

    @property
    def tracking_id(self):
        return f"T-{id(self)}"
# endregion


class Cashier:
    def __init__(self, barista):
        self.barista = barista

    # region: Cashier#charge
    def charge(self, order):
        order = TrackedOrder(order)  # the order arrives wrapped…
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
            return  # …but it falls into the same if tree
        # endregion
        self.barista.prepare(order)
    # endregion
