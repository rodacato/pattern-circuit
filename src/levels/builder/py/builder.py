class InvalidOrder(Exception):
    pass


class OrderBuilder:
    def __init__(self):
        self._size = self._milk = self._syrup = self._shots = self._temp = self._ice = None

    # Every step has a name: impossible to put the syrup where the milk goes.
    # region: OrderBuilder#size
    def size(self, value):
        self._size = value
        return self
    # endregion

    # region: OrderBuilder#milk
    def milk(self, value):
        self._milk = value
        return self
    # endregion

    # region: OrderBuilder#extras
    def syrup(self, value):
        self._syrup = value
        return self

    def shots(self, count):
        self._shots = count
        return self

    def hot(self):
        self._temp = "hot"
        return self

    def iced(self):
        self._ice = True
        return self
    # endregion

    # Validates the whole order before it exists: the impossible never even reaches the register.
    # region: OrderBuilder#build
    def build(self):
        if self._temp == "hot" and self._ice:
            raise InvalidOrder("hot and iced is not possible")
        return Order(size=self._size, milk=self._milk, syrup=self._syrup, shots=self._shots, temp=self._temp, ice=self._ice)
    # endregion


class OrderTaker:
    def __init__(self, cashier, counter):
        self.cashier = cashier
        self.counter = counter

    # region: OrderTaker#take
    def take(self, request):
        try:
            order = OrderBuilder().size("large").milk("oat").syrup("vanilla").shots(2).hot().build()
            self.cashier.charge(order)
        except InvalidOrder as e:
            self.counter.notify(str(e))
    # endregion
