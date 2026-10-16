class Order:
    # Nine positional arguments: nothing stops you from swapping the milk and the syrup.
    # region: Order#initialize
    def __init__(self, size, milk, shots, syrup, temp, ice, cup, name, to_go):
        self.size, self.milk, self.shots, self.syrup = size, milk, shots, syrup
        self.temp, self.ice, self.cup, self.name, self.to_go = temp, ice, cup, name, to_go
    # endregion


class OrderTaker:
    def __init__(self, cashier):
        self.cashier = cashier

    # region: OrderTaker#take
    def take(self, request):
        order = Order("large", "vanilla", 2, "oat", "hot", False, None, "Ana", None)
        #                       ^ milk and syrup swapped, and nobody complains
        self.cashier.charge(order)
    # endregion
