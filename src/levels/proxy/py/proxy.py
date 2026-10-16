# Same contract as RemoteInventory; only goes to the warehouse if it doesn't know the answer.
# region: CachedInventory#in_stock?
class CachedInventory:
    def __init__(self, real):
        self.real = real
        self.known = {}

    def in_stock(self, item):
        if item not in self.known:
            self.known[item] = self.real.in_stock(item)
        return self.known[item]
# endregion


# OrderTaker doesn't notice the change: it gets something that answers the same.
# region: wiring
taker = OrderTaker(CachedInventory(RemoteInventory()), barista)
# endregion
