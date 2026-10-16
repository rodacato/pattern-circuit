# --- the rest of the coffee shop does not change in this level ---
from dataclasses import dataclass


@dataclass
class Order:
    drink: str
    payment: str
    total: int


class OrderTaker:
    def __init__(self, cashier):
        self.cashier = cashier

    # region: OrderTaker#take
    def take(self, drink, payment):
        self.cashier.charge(Order(drink, payment, 45))
    # endregion


class Barista:
    def __init__(self, counter):
        self.counter = counter

    # region: Barista#prepare
    def prepare(self, order):
        self.counter.hand_over(order)
    # endregion


class Counter:
    # region: Counter#hand_over
    def hand_over(self, order):
        print(f"{order.drink} ready!")
    # endregion
