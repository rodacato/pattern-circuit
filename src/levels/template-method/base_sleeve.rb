class CoffeeRecipe
  # region: CoffeeRecipe#make
  def make
    boil_water
    extract
    pour_in_cup
    put_lid
    add_sleeve # ← cambio 1
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
    add_sleeve # ← cambio 2: la misma línea en la otra copia
  end
  # endregion
end
