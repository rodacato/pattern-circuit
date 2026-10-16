# Each step has its compensating action. If one fails, the previous ones are undone in reverse order.
class PlaceOrderSaga:
    STEPS = [
        (lambda o: Payments.charge(o), lambda o: Payments.refund(o)),
        (lambda o: Inventory.reserve(o), lambda o: Inventory.release(o)),
    ]

    # region: PlaceOrderSaga#call
    def call(self, order):
        done = []
        try:
            for step, compensation in self.STEPS:
                step(order)
                done.append(compensation)
            Barista().prepare(order)
        except OutOfStock:
            for compensation in reversed(done):
                compensation(order)
            Counter().notify(order, "No supplies left: we refunded your money")
    # endregion


# region: Payments.charge
class Payments:
    @staticmethod
    def charge(order):
        Gateway.charge(order.total)

    @staticmethod
    def refund(order):
        Gateway.refund(order.total)
# endregion


# region: Payments.refund
# The compensation for the charge: it does not erase the past, it corrects it with a refund.
# endregion


# region: Inventory.reserve
class Inventory:
    @staticmethod
    def reserve(order):
        if not Stock.is_available(order.items):
            raise OutOfStock()

    @staticmethod
    def release(order):
        Stock.release(order.items)
# endregion
