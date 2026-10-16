# --- the rest of the coffee shop ---
class History
  # region: History#record
  def record(order, event) = puts("#{event} → #{order.status}")
  # endregion

  # region: History#reject
  def reject(order, event) = puts("#{event} does not apply when the order is #{order.status}")
  # endregion
end
