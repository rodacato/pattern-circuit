# --- el resto de la cafetería ---
class Lobby
  def initialize(registers) = @registers = registers

  # region: Lobby#route
  def route(order) = @registers.fetch(order.register).checkout(order)
  # endregion
end

class Display
  # region: Display#show
  def show(order) = puts("Turno #{order.ticket}")
  # endregion
end
