from abc import ABC, abstractmethod


# The recipe skeleton lives in one place; subclasses only fill in `brew`.
class Recipe(ABC):
    def __init__(self):
        self.cup = Cup()

    # region: Recipe#make
    def make(self):
        self.boil_water()
        self.brew()
        self.pour_in_cup()
        self.put_lid()
        self.add_sleeve()  # ← a single place
    # endregion

    # region: Recipe#boil_water
    def boil_water(self):
        self.heat("water", 92)
    # endregion

    # region: Recipe#pour_in_cup
    def pour_in_cup(self):
        self.cup.fill()
    # endregion

    # region: Recipe#put_lid
    def put_lid(self):
        self.cup.lid()
    # endregion

    # region: Recipe#add_sleeve
    def add_sleeve(self):
        self.cup.sleeve()
    # endregion

    @abstractmethod
    def brew(self):
        ...


class CoffeeRecipe(Recipe):
    # region: CoffeeRecipe#brew
    def brew(self):
        self.extract_espresso()
    # endregion


class TeaRecipe(Recipe):
    # region: TeaRecipe#brew
    def brew(self):
        self.steep(3 * 60)
    # endregion
