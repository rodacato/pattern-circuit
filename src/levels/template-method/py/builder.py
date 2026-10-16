class CoffeeRecipe:
    # region: CoffeeRecipe#make
    def make(self):
        self.boil_water()
        self.extract()
        self.pour_in_cup()
        self.put_lid()
    # endregion


class TeaRecipe:
    # Copy of the coffee recipe… that forgot the lid.
    # region: TeaRecipe#make
    def make(self):
        self.boil_water()
        self.steep()
        self.pour_in_cup()
    # endregion


# Building the cup step by step before the recipe does not touch the tea recipe.
# region: CupBuilder
class CupBuilder:
    def __init__(self):
        self.cup_size = ""

    def size(self, s):
        self.cup_size = s
        return self

    def build(self):
        return Cup(self.cup_size)
# endregion
