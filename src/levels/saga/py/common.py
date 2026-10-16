# --- the rest of the coffee shop ---
class Barista:
    def __init__(self):
        self.counter = Counter()

    # region: Barista#prepare
    def prepare(self, order):
        self.counter.hand_over(order)
    # endregion


class Counter:
    # region: Counter#hand_over
    def hand_over(self, order):
        print("Ready!")
    # endregion

    # region: Counter#notify
    def notify(self, order, message):
        print(f"{order.customer}: {message}")
    # endregion
