class Order:
    def __init__(self):
        self.status = "pending"
        self.history = History()

    # Each event changes the status without asking if it makes sense.
    # The rules are scattered across ifs, in every method… when someone remembers.
    # region: Order#handle
    def handle(self, event):
        match event:
            case "pay":
                self.status = "paid"
            case "prepare":
                self.status = "preparing"  # what if it isn't paid?
            case "deliver":
                self.status = "delivered"  # what if it isn't prepared?
            case "cancel":
                self.status = "cancelled"  # what if it was already delivered?
        self.history.record(self, event)
    # endregion
