class Order:
    def __init__(self, notifier):
        self.status = "pending"
        self.notifier = notifier

    # Strategy picks ONE way to notify: display, or push, or loyalty.
    # region: Order#complete!
    def complete(self):
        self.status = "ready"
        self.notifier.update(self)
    # endregion
