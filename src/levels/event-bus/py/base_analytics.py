# Each service that produces something calls each interested service by hand.
class Orders:
    # region: Orders#place
    def place(self, order):
        Inventory().on_event(order)
        Billing().on_event(order)
        Loyalty().on_event(order)
        Analytics().on_event(order)  # ← change 1
    # endregion


class Returns:
    # Returns copied the list… and forgot Billing and Loyalty.
    # region: Returns#process
    def process(self, return_request):
        Inventory().on_event(return_request)
        Analytics().on_event(return_request)  # ← change 2
    # endregion
