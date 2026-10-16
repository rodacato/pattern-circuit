# --- the rest of the coffee shop ---
class Bar
  # region: Bar#order
  def order(kind) = { coffee: CoffeeRecipe, tea: TeaRecipe }.fetch(kind).new.make
  # endregion
end

class Pickup
  # region: Pickup#hand_over
  def hand_over(cup) = puts("Ready!")
  # endregion
end
