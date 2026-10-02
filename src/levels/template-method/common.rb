# --- el resto de la cafetería ---
class Bar
  # region: Bar#order
  def order(kind) = { cafe: CoffeeRecipe, te: TeaRecipe }.fetch(kind).new.make
  # endregion
end

class Pickup
  # region: Pickup#hand_over
  def hand_over(cup) = puts("¡Listo!")
  # endregion
end
