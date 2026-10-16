from abc import ABC, abstractmethod


class Branch(ABC):
    def __init__(self, barista):
        self.barista = barista

    # The flow is the same for all of them; only `create_drink` changes.
    # region: Branch#take
    def take(self, order):
        drink = self.create_drink()
        self.barista.prepare(drink)
    # endregion

    @abstractmethod
    def create_drink(self): ...


class DowntownBranch(Branch):
    # region: DowntownBranch#create_drink
    def create_drink(self):
        return Latte()
    # endregion


class BeachBranch(Branch):
    # region: BeachBranch#create_drink
    def create_drink(self):
        return Frappe()
    # endregion


class MountainBranch(Branch):
    # region: MountainBranch#create_drink
    def create_drink(self):
        return HotChocolate()
    # endregion
