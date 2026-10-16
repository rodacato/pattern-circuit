# --- the rest of the coffee shop ---
import time


class OrderTaker:
    def __init__(self, inventory, barista):
        self.inventory = inventory
        self.barista = barista

    # region: OrderTaker#take
    def take(self, order):
        if not self.inventory.in_stock(order.item):
            return
        self.barista.prepare(order)
    # endregion


# The warehouse is far away: each query takes time and serves one at a time.
class RemoteInventory:
    # region: RemoteInventory#in_stock?
    def in_stock(self, item):
        time.sleep(2)  # round trip to the warehouse
        return Warehouse.api.stock(item) > 0
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
        print(f"{order.item} ready!")
    # endregion
