class Order:
    def __init__(self):
        self.status = "pending"
        self.subscribers = []

    # Anyone can subscribe; Order doesn't know who they are.
    def subscribe(self, subscriber):
        self.subscribers.append(subscriber)

    # region: Order#complete!
    def complete(self):
        self.status = "ready"
        for s in self.subscribers:
            s.update(self)
    # endregion


# region: wiring
order = Order()
for s in [Display(), PushNotifier(), LoyaltyProgram(), Kitchen()]:  # ← just one more subscription
    order.subscribe(s)
# endregion
