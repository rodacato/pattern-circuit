from functools import reduce


# region: Latte
class Latte:
    def cost(self):
        return 45

    def description(self):
        return "Latte"
# endregion


# Each extra wraps the drink and adds its own cost. They combine on their own.
# region: WithOatMilk
class WithOatMilk:
    def __init__(self, drink):
        self.drink = drink

    def cost(self):
        return self.drink.cost() + 8

    def description(self):
        return f"{self.drink.description()} with oat"
# endregion


# region: WithShot
class WithShot:
    def __init__(self, drink):
        self.drink = drink

    def cost(self):
        return self.drink.cost() + 10

    def description(self):
        return f"{self.drink.description()} with shot"
# endregion


# region: WithCinnamon
class WithCinnamon:
    def __init__(self, drink):
        self.drink = drink

    def cost(self):
        return self.drink.cost() + 5

    def description(self):
        return f"{self.drink.description()} with cinnamon"
# endregion


class Menu:
    EXTRAS = {"oat": WithOatMilk, "shot": WithShot, "cinnamon": WithCinnamon}

    # region: Menu#drink_for
    def drink_for(self, request):
        return reduce(lambda drink, extra: Menu.EXTRAS[extra](drink), request.extras, Latte())
    # endregion
