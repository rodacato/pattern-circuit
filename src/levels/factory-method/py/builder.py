class DrinkBuilder:
    def __init__(self):
        self._size = None
        self._temperature = None

    # region: DrinkBuilder#size
    def size(self, value):
        self._size = value
        return self
    # endregion
    # region: DrinkBuilder#temperature
    def temperature(self, value):
        self._temperature = value
        return self
    # endregion

    def build(self):
        return {"size": self._size, "temperature": self._temperature}


class OrderFlow:
    def __init__(self, branch, barista):
        self.branch = branch
        self.barista = barista

    # The Builder assembles the details… but the decision of which drink to create is still here.
    # region: OrderFlow#create_drink
    def create_drink(self):
        # region: OrderFlow#create_drink:downtown
        if self.branch == "downtown":
            return Latte()
        # endregion
        # region: OrderFlow#create_drink:beach
        elif self.branch == "beach":
            return Frappe()
        # endregion
        # region: OrderFlow#create_drink:else
        else:
            return Latte()
        # endregion
    # endregion

    def take(self, order):
        self.barista.prepare(self.create_drink())
