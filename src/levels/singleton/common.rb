# --- the rest of the coffee shop ---
class Lobby
  def initialize(registers) = @registers = registers

  # region: Lobby#route
  def route(order) = @registers.fetch(order.register).checkout(order)
  # endregion
end

class Display
  # region: Display#show
  def show(order) = puts("Ticket #{order.ticket}")
  # endregion
end
