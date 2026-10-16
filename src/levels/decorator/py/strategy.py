# region: Latte
class Latte:
    def __init__(self, extra=None):
        self.extra = extra or NoExtra()  # a default argument is built once, so no NoExtra() in the signature

    def cost(self):
        return 45 + self.extra.cost()

    def description(self):
        return "Latte"
# endregion


# Strategy picks ONE way to calculate: only one extra fits per drink here.
# region: OatMilkPricing
class OatMilkPricing:
    def cost(self):
        return 8
# endregion


# region: ShotPricing
class ShotPricing:
    def cost(self):
        return 10
# endregion


# region: CinnamonPricing
class CinnamonPricing:
    def cost(self):
        return 5
# endregion


class Menu:
    # region: Menu#drink_for
    def drink_for(self, request):
        pricing = {"oat": OatMilkPricing, "shot": ShotPricing, "cinnamon": CinnamonPricing}[request.extras[0]]
        return Latte(pricing())  # the second and third extras are lost
    # endregion
