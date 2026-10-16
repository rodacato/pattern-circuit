# --- who reads and who writes ---
class OrderBoard:
    # region: OrderBoard#show
    def show(self, orders):
        render(orders)  # the screens ask all the time
    # endregion


class Counter:
    # region: Counter#saved
    def saved(self, order):
        print(f"Order {order.id} saved")
    # endregion
