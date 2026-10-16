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
