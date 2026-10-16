class Order:
    def __init__(self, display, push, kitchen):
        self.status = "pending"
        self.display = display
        self.push = push
        self.kitchen = kitchen  # ← another interested party, another dependency

    # region: Order#complete!
    def complete(self):
        self.status = "ready"
        self.display.update(self)
        self.push.update(self)
        self.kitchen.update(self)  # ← Order modified again
    # endregion
