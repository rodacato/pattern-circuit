# --- the rest of the coffee shop ---
class Barista
  # region: Barista#prepare
  def prepare(drink) = @pickup.hand_over(drink)
  # endregion
end

class Pickup
  # region: Pickup#hand_over
  def hand_over(drink) = puts("#{drink} ready!")
  # endregion
end
