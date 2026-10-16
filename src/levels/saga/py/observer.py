
# Notify those interested of the failure… they find out, but nobody refunds the money.
# region: OrderFailedNotifier
class OrderFailedNotifier:
    def __init__(self):
        self.subscribers = []

    def notify(self, order):
        for s in self.subscribers:
            s.order_failed(order)
# endregion
