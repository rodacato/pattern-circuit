# Each service that produces something calls each interested service by hand.
class Orders:
    # region: Orders#place
    def place(self, order):
        Inventory().on_event(order)
        Billing().on_event(order)
        Loyalty().on_event(order)
    # endregion


class Returns:
    # Returns copied the list… and forgot Billing and Loyalty.
    # region: Returns#process
    def process(self, return_request):
        Inventory().on_event(return_request)
    # endregion


# A facade that groups the services… that each producer still calls with its own list.
# region: Services
class Services:
    def notify(self, event, *targets):
        for t in targets:
            t.on_event(event)
# endregion
