# Each producer is a subject with its own list of subscribers… and the lists do not match.
class Orders:
    def __init__(self):
        self.subscribers = []

    # region: Orders#place
    def place(self, order):
        for s in self.subscribers:  # Inventory, Billing, Loyalty
            s.on_event(order)
    # endregion


class Returns:
    def __init__(self):
        self.subscribers = []

    # region: Returns#process
    def process(self, return_request):
        for s in self.subscribers:  # only Inventory
            s.on_event(return_request)
    # endregion
