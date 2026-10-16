# --- the rest of the coffee shop doesn't change in this level ---
class Order:
    def __init__(self, drink):
        self.drink = drink


class OrderTaker:
    def __init__(self, cashier):
        self.cashier = cashier

    # region: OrderTaker#take
    def take(self, drink):
        self.cashier.charge(Order(drink))
    # endregion


class Kitchen:
    def __init__(self, counter):
        self.counter = counter

    # region: Kitchen#start
    def start(self, order):
        self.counter.hand_over(order)
    # endregion


class Counter:
    # region: Counter#hand_over
    def hand_over(self, order):
        print(f"{order.drink} ready!")
    # endregion
