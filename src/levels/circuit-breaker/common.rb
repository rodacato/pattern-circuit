# --- el resto de la cafetería ---
class Cashier
  # region: Cashier#charge
  def charge(order) = @gateway.charge(order)
  # endregion
end

class OfflinePayments
  # Respaldo: anota el cobro y lo procesa cuando el proveedor vuelva.
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
  def hand_over(order) = puts("¡Listo!")
  # endregion
end
