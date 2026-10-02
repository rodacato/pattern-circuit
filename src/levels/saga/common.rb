# --- the rest of the coffee shop ---
class Barista
  # region: Barista#prepare
  def prepare(order) = @counter.hand_over(order)
  # endregion
end

class Counter
  # region: Counter#hand_over
  def hand_over(order) = puts("Ready!")
  # endregion

  # region: Counter#notify
  def notify(order, message) = puts("#{order.customer}: #{message}")
  # endregion
end
