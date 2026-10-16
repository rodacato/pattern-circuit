# --- who orders and who confirms ---
class WebApp:
    def __init__(self, orders):
        self.orders = orders

    # region: WebApp#checkout
    def checkout(self, params):
        return self.orders.place(params)
    # endregion


class Receipt:
    # region: Receipt#confirm
    def confirm(self, order):
        print(f"Order {order.id} confirmed")
    # endregion
