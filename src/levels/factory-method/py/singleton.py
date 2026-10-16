class DrinkFactory:
    _instance = None

    # One single factory for all the branches.
    @classmethod
    def instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    # region: DrinkFactory#create
    def create(self):
        return Latte()  # the single instance does not know which branch the order comes from
    # endregion


class OrderFlow:
    def __init__(self, barista):
        self.barista = barista

    def take(self, order):
        self.barista.prepare(DrinkFactory.instance().create())
