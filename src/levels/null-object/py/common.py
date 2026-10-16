# --- who uses the customer's card ---
class Loyalty:
    # region: Loyalty#reward
    def reward(self, order):
        order.card.add_points(order.total)
    # endregion


class Discounts:
    # region: Discounts#apply
    def apply(self, order):
        order.total -= order.card.discount
    # endregion


class Receipt:
    # region: Receipt#print
    def print(self, order):
        print(f"Card: {order.card.masked_number}")
    # endregion


class Counter:
    # region: Counter#hand_over
    def hand_over(self, order):
        print("Ready!")
    # endregion
