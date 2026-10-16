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


# Picking the recipe as a strategy does not remove the duplication: they are two complete algorithms.
# region: RecipeStrategy
RECIPES = {"coffee": CoffeeRecipe, "tea": TeaRecipe}
# endregion
