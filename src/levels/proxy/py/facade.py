# A facade with a single door… that calls the warehouse just as often.
# region: StockDesk#in_stock?
class StockDesk:
    def __init__(self, inventory):
        self.inventory = inventory

    def in_stock(self, item):
        return self.inventory.in_stock(item)
# endregion


# region: wiring
taker = OrderTaker(StockDesk(RemoteInventory()), barista)
# endregion
