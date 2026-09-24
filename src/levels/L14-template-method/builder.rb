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

# Armar la taza paso a paso antes de la receta no toca la receta del té.
# region: CupBuilder
class CupBuilder
  def size(s) = tap { @size = s }
  def build = Cup.new(@size)
end
# endregion
