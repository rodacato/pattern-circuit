

from functools import reduce


# region: WithOatMilk
class WithOatMilk(Product):
    def __init__(self, inner):
        self.inner = inner

    def make(self):
        drink = self.inner.make()
        drink.extras.append("oat")
        return drink
# endregion


# region: WithShot
class WithShot(Product):
    def __init__(self, inner):
        self.inner = inner

    def make(self):
        drink = self.inner.make()
        drink.extras.append("shot")
        return drink
# endregion


class CoffeeMenu:
    EXTRAS = {"oat": WithOatMilk, "shot": WithShot}

    # The combo's coffee is wrapped with each extra: it is still just another Product inside the combo.
    # region: CoffeeMenu#drink_for
    def drink_for(self, extras):
        return reduce(lambda drink, e: CoffeeMenu.EXTRAS[e](drink), extras, Latte())
    # endregion
