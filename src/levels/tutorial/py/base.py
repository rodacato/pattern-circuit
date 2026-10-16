from dataclasses import dataclass


@dataclass
class Order:
    drink: str


class OrderTaker:
    def __init__(self, cashier):
        self.cashier = cashier

    # region: OrderTaker#take
    def take(self, drink):
        self.cashier.charge(Order(drink))
    # endregion


class Cashier:
    def __init__(self, barista):
        self.barista = barista

    # region: Cashier#charge
    def charge(self, order):
        print(f"Charged: {order.drink}")
        self.barista.prepare(order)
    # endregion


class Barista:
    # region: Barista#prepare
    def prepare(self, order):
        print(f"Preparing {order.drink}...")
        # and now who do I hand it to? A wire is missing.
    # endregion


class Counter:
    # region: Counter#hand_over
    def hand_over(self, order):
        print(f"{order.drink} ready!")
    # endregion


# region: wiring
taker = OrderTaker(Cashier(Barista()))
taker.take("espresso")
# endregion
