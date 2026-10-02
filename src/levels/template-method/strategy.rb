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

# Picking the recipe as a strategy does not remove the duplication: they are two complete algorithms.
# region: RecipeStrategy
RECIPES = { coffee: CoffeeRecipe, tea: TeaRecipe }
# endregion
