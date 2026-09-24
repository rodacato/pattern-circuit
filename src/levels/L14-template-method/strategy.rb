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
  # Copia de la receta del café… a la que se le olvidó la tapa.
  # region: TeaRecipe#make
  def make
    boil_water
    steep
    pour_in_cup
  end
  # endregion
end

# Elegir la receta como estrategia no quita la duplicación: son dos algoritmos completos.
# region: RecipeStrategy
RECIPES = { cafe: CoffeeRecipe, te: TeaRecipe }
# endregion
