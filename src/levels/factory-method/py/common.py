# --- products and the rest of the coffee shop ---
# region: Latte
class Latte:
    pass
# endregion
# region: Frappe
class Frappe:
    pass
# endregion
# region: HotChocolate
class HotChocolate:
    pass
# endregion
# region: IcedTea
class IcedTea:
    pass
# endregion


class OrderTaker:
    def __init__(self, branches):
        self.branches = branches

    # region: OrderTaker#take
    def take(self, order):
        self.branches[order.branch].take(order)
    # endregion


class Barista:
    def __init__(self, counter):
        self.counter = counter

    # region: Barista#prepare
    def prepare(self, drink):
        self.counter.hand_over(drink)
    # endregion


class Counter:
    # region: Counter#hand_over
    def hand_over(self, drink):
        print(f"{type(drink).__name__} ready!")
    # endregion
