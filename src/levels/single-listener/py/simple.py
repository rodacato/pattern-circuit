# A single interested party: Cashier calls it directly and the flow reads straight through.
class Cashier:
    def __init__(self, kitchen):
        self.kitchen = kitchen

    # region: Cashier#charge
    def charge(self, order):
        CardTerminal.charge(order)
        self.kitchen.start(order)
    # endregion


# region: wiring
OrderTaker(Cashier(Kitchen(Counter()))).take("latte")
# endregion
