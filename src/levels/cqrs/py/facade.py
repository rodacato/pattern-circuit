
# A single desk in front of the store: everyone goes through it into the same queue.
# region: OrdersDesk
class OrdersDesk:
    def handle(self, request):
        return OrderStore().handle(request)
# endregion
