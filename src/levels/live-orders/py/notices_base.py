class OrderUpdates:
    def __init__(self, display, push):
        self.display = display
        self.push = push

    # The updates know each interested party by name… and nobody remembered Loyalty.
    # region: OrderUpdates#publish
    def publish(self, order):
        self.display.update(order)
        self.push.update(order)
    # endregion
