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


# region: CaramelLatte
class CaramelLatte(Latte):
    def cost(self):
        return super().cost() + 7

    def description(self):
        return "Latte with caramel"
# endregion


class Menu:
    # region: Menu#drink_for
    def drink_for(self, request):
        # region: Menu#drink_for:combo:oat
        if request.extras == ["oat"]:
            return OatMilkLatte()
        # endregion
        # region: Menu#drink_for:combo:shot
        elif request.extras == ["shot"]:
            return ShotLatte()
        # endregion
        # region: Menu#drink_for:combo:oat-shot
        elif request.extras == ["oat", "shot"]:
            return OatShotLatte()
        # endregion
        # region: Menu#drink_for:combo:caramel
        elif request.extras == ["caramel"]:
            return CaramelLatte()  # ← and all its combinations are missing
        # endregion
        # region: Menu#drink_for:else
        else:
            raise Exception("There is no OatShotCinnamonLatte class")  # 3 extras = 8 classes; 4 extras = 16…
        # endregion
    # endregion
