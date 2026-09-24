# --- el resto de la cafetería ---
class History
  # region: History#record
  def record(order, event) = puts("#{event} → #{order.status}")
  # endregion

  # region: History#reject
  def reject(order, event) = puts("#{event} no aplica cuando el pedido está #{order.status}")
  # endregion
end
