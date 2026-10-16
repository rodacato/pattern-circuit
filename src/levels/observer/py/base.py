class Order:
    def __init__(self, display, push):
        self.status = "pending"
        self.display = display
        self.push = push

    # Order knows each interested party by name… and nobody remembered Loyalty.
    # region: Order#complete!
    def complete(self):
        self.status = "ready"
        self.display.update(self)
        self.push.update(self)
    # endregion
