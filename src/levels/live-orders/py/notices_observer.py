class OrderUpdates:
    def __init__(self):
        self.subscribers = []

    # Anyone can subscribe; the updates don't know who they are.
    def subscribe(self, subscriber):
        self.subscribers.append(subscriber)

    # region: OrderUpdates#publish
    def publish(self, order):
        for s in self.subscribers:
            s.update(order)
    # endregion


# region: wiring
updates = OrderUpdates()
for s in [Display(), PushNotifier(), LoyaltyProgram()]:
    updates.subscribe(s)
# endregion
