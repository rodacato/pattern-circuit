# --- el resto de la cafetería ---
class Tray
  # region: Tray#collect
  def collect(parts) = @parts.concat(parts) # espera todas las partes del pedido
  # endregion

  # region: Tray#serve
  def serve = @counter.hand_over(@parts)
  # endregion
end

class Counter
  # region: Counter#hand_over
  def hand_over(parts) = puts("Bandeja con #{parts.size} cosas")
  # endregion
end
