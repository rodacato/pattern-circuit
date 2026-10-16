class CoffeeRecipe
  # region: CoffeeRecipe#make
  def make
    boil_water
    extract
    pour_in_cup
    put_lid
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
  end
  # endregion
end
