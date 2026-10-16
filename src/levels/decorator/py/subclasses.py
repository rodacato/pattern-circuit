class Latte:
    def cost(self):
        return 45

    def description(self):
        return "Latte"


# One subclass for each combination of extras.
# region: OatMilkLatte
class OatMilkLatte(Latte):
    def cost(self):
        return super().cost() + 8

    def description(self):
        return "Latte with oat"
# endregion


# region: ShotLatte
class ShotLatte(Latte):
    def cost(self):
        return super().cost() + 10

    def description(self):
        return "Latte with shot"
# endregion


# region: OatShotLatte
class OatShotLatte(Latte):
    def cost(self):
        return super().cost() + 18

    def description(self):
        return "Latte with oat and shot"
# endregion
