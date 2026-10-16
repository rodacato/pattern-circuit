# --- the rest of the coffee shop ---
class Tray
  # region: Tray#collect
  def collect(parts) = @parts.concat(parts) # expects all the parts of the order
  # endregion

  # region: Tray#serve
  def serve = @counter.hand_over(@parts)
  # endregion
end

class Counter
  # region: Counter#hand_over
  def hand_over(parts) = puts("Tray with #{parts.size} items")
  # endregion
end
