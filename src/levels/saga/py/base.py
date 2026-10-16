class PlaceOrder:
    # Three steps, each in its own service: there is no transaction wrapping them all.
    # region: PlaceOrder#call
    def call(self, order):
        Payments.charge(order)      # 1. charge (no way back now)
        Inventory.reserve(order)    # 2. out of oat? OutOfStock… and the customer already paid
        Barista().prepare(order)    # 3.
    # endregion


# region: Payments.charge
class Payments:
    @staticmethod
    def charge(order):
        return Gateway.charge(order.total)
# endregion


# region: Inventory.reserve
class Inventory:
    @staticmethod
    def reserve(order):
        if not Stock.is_available(order.items):
            raise OutOfStock()
# endregion
