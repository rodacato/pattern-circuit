# --- the rest of the coffee shop ---
class OrderTaker:
    def __init__(self, menu, barista):
        self.menu = menu
        self.barista = barista

    # region: OrderTaker#take
    def take(self, request):
        self.barista.prepare(self.menu.drink_for(request))
    # endregion


class Barista:
    def __init__(self, counter):
        self.counter = counter

    # region: Barista#prepare
    def prepare(self, drink):
        self.counter.hand_over(drink)
    # endregion


class Counter:
    # region: Counter#hand_over
    def hand_over(self, drink):
        print(f"{drink.description()}: ${drink.cost()}")
    # endregion
