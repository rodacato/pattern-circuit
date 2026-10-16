class Order:
    # region: Order#initialize
    def __init__(self, size, temp):
        self.size, self.temp = size, temp
    # endregion


# Extras stack as named wrappers: they no longer get swapped.
# region: WithMilk
class WithMilk:
    def __init__(self, order, milk):
        self.inner = order
        self.milk = milk
# endregion


# region: WithSyrup
class WithSyrup:
    def __init__(self, order, syrup):
        self.inner = order
        self.syrup = syrup
# endregion


class WithIce:
    def __init__(self, order):
        self.inner = order

    def is_iced(self):
        return True


class OrderTaker:
    def __init__(self, cashier):
        self.cashier = cashier

    # …but nobody checks the whole order: hot + ice gets through and blows up in the kitchen.
    # region: OrderTaker#take
    def take(self, request):
        order = WithSyrup(WithMilk(Order("large", "hot"), "oat"), "vanilla")
        self.cashier.charge(order)
    # endregion
