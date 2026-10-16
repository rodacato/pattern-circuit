# --- the rest of the coffee shop ---
class Tray:
    def __init__(self, counter):
        self.counter = counter
        self.parts = []

    # region: Tray#collect
    def collect(self, parts):
        self.parts.extend(parts)  # expects all the parts of the order
    # endregion

    # region: Tray#serve
    def serve(self):
        self.counter.hand_over(self.parts)
    # endregion


class Counter:
    # region: Counter#hand_over
    def hand_over(self, parts):
        print(f"Tray with {len(parts)} items")
    # endregion
