class CoffeeRecipe
  # region: CoffeeRecipe#make
  def make
    boil_water
    extract
    pour_in_cup
    put_lid
    add_sleeve # ← change 1
  end
  # endregion
end

class TeaRecipe
  # Copy of the coffee recipe… that forgot the lid.
  # region: TeaRecipe#make
  def make
    boil_water
    steep
    pour_in_cup
    add_sleeve # ← change 2: the same line in the other copy
  end
  # endregion
end
