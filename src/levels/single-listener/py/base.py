# Only the kitchen needs to know an order was charged… and nobody tells it.
class Cashier:
    # region: Cashier#charge
    def charge(self, order):
        CardTerminal.charge(order)
        # and the kitchen? The order is left waiting.
    # endregion


# region: wiring
OrderTaker(Cashier()).take("latte")
# endregion
