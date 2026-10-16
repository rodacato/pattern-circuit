class Product:
    # region: Product#make
    def make(self):
        return self
    # endregion


# region: Combo
class Combo:
    def __init__(self, *items):
        # region: Combo#items
        self.items = items
        # endregion
# endregion


class Kitchen:
    def __init__(self, tray):
        self.tray = tray

    # The kitchen asks what each thing is… and can only go down one level.
    # region: Kitchen#prepare
    def prepare(self, item):
        # region: Kitchen#prepare:product
        if isinstance(item, Product):
            self.tray.collect([item.make()])
        # endregion
        # region: Kitchen#prepare:combo
        elif isinstance(item, Combo):
            for child in item.items:
                if isinstance(child, Combo):
                    raise Exception("A combo inside a combo?")
                self.tray.collect([child.make()])
        # endregion
    # endregion
