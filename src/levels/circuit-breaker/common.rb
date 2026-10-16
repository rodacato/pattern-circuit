# --- the rest of the coffee shop ---
class Cashier
  # region: Cashier#charge
  def charge(order) = @gateway.charge(order)
  # endregion
end

class OfflinePayments
  # Fallback: records the charge and processes it when the provider is back.
  # region: OfflinePayments#charge
  def charge(order) = @pending << order
  # endregion
end

class Barista
  # region: Barista#prepare
  def prepare(order) = @counter.hand_over(order)
  # endregion
end

class Counter
  # region: Counter#hand_over
  def hand_over(order) = puts("Ready!")
  # endregion
end
