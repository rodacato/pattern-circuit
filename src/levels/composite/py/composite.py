from abc import ABC, abstractmethod


# Leaf and group answer the same message: `make`.
class Item(ABC):
    @abstractmethod
    def make(self):
        ...


class Product(Item):
    # region: Product#make
    def make(self):
        return [self]
    # endregion


class Combo(Item):
    def __init__(self, *items):
        self.items = items

    # A combo makes its own by asking each part for `make`, whether product or combo.
    # region: Combo#make
    def make(self):
        return [part for item in self.items for part in item.make()]
    # endregion


class Kitchen:
    def __init__(self, tray):
        self.tray = tray

    # Not a single if: the kitchen no longer asks what each thing is.
    # region: Kitchen#prepare
    def prepare(self, item):
        self.tray.collect(item.make())
    # endregion
