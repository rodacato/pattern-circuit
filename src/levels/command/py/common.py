# --- the rest of the coffee shop ---
class Barista:
    def __init__(self):
        self.pickup = Pickup()

    # region: Barista#prepare
    def prepare(self, drink):
        self.pickup.hand_over(drink)
    # endregion


class Pickup:
    # region: Pickup#hand_over
    def hand_over(self, drink):
        print(f"{drink} ready!")
    # endregion
