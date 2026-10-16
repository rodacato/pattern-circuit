# One strategy per event… but none remembers which state the order is in.
class Order:
    HANDLERS = {
        "pay": PayHandler, "prepare": PrepareHandler, "deliver": DeliverHandler, "cancel": CancelHandler,
    }

    def __init__(self):
        self.status = "pending"
        self.history = History()

    # region: EventHandlers
    def handle(self, event):
        self.status = Order.HANDLERS[event]().apply()  # always applies, no matter what
        self.history.record(self, event)
    # endregion
