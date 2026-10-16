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
    def __init__(self, counter):
        self.counter = counter

    # region: Barista#prepare
    def prepare(self, order):
        print(f"Preparing {order.drink}...")
        self.counter.hand_over(order)
    # endregion


class Counter:
    # region: Counter#hand_over
    def hand_over(self, order):
        print(f"{order.drink} ready!")
    # endregion


# region: wiring
# Each constructor argument is a wire: this is how the circuit looks in code.
taker = OrderTaker(Cashier(Barista(Counter())))
taker.take("espresso")
# endregion
