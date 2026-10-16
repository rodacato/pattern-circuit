from threading import Lock


# A single model for everything: the screens and the counter queue up in the same place.
class OrderStore:
    def __init__(self):
        self.mutex = Lock()

    # region: OrderStore#handle
    def handle(self, request):
        # region: OrderStore#handle:read
        if request.is_read():
            with self.mutex:
                return orders_with_items_and_customers()  # heavy query, one at a time
        # endregion
        # region: OrderStore#handle:write
        else:
            with self.mutex:
                return validate_and_save(request.order)
        # endregion
    # endregion
