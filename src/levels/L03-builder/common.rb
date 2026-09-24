# --- el resto de la cafetería ---
class Cashier
  def initialize(barista) = @barista = barista

  # region: Cashier#charge
  def charge(order)
    CardTerminal.charge(order.total)
    @barista.prepare(order)
  end
  # endregion
end

class Barista
  def initialize(counter) = @counter = counter

  # La cocina es el último lugar donde descubrir que un pedido era imposible: ya se cobró.
  # region: Barista#prepare
  def prepare(order)
    raise "¿Hielo en una bebida hirviendo?" if order.hot? && order.ice?
    @counter.hand_over(order)
  end
  # endregion
end

class Counter
  # region: Counter#hand_over
  def hand_over(order) = puts("¡#{order.name} listo!")
  # endregion

  # region: Counter#notify
  def notify(message) = puts("Antes de cobrar: #{message}")
  # endregion
end
