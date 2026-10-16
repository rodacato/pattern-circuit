class CoffeeRecipe:
    # region: CoffeeRecipe#make
    def make(self):
        self.boil_water()
        self.extract()
        self.pour_in_cup()
        self.put_lid()
        self.add_sleeve()  # ← change 1
    # endregion


class TeaRecipe:
    # Copy of the coffee recipe… that forgot the lid.
    # region: TeaRecipe#make
    def make(self):
        self.boil_water()
        self.steep()
        self.pour_in_cup()
        self.add_sleeve()  # ← change 2: the same line in the other copy
    # endregion
