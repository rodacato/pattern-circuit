# Command turns the call into an object… that nobody queues, undoes or logs.
class StartOrder:
    def __init__(self, kitchen, order):
        self.kitchen = kitchen
        self.order = order

    # region: StartOrder#call
    def call(self):
        self.kitchen.start(self.order)
    # endregion


class Cashier:
    def __init__(self, kitchen):
        self.kitchen = kitchen

    # region: Cashier#charge
    def charge(self, order):
        CardTerminal.charge(order)
        StartOrder(self.kitchen, order).call()
    # endregion


# region: wiring
OrderTaker(Cashier(Kitchen(Counter()))).take("latte")
# endregion
