# Cada estado es un objeto que sabe qué eventos acepta y a qué estado lleva.
class Order
  attr_accessor :state

  def initialize = @state = Pending.new

  # region: Order#handle
  def handle(event)
    next_state = @state.on(event)
    return @history.reject(self, event) unless next_state
    @state = next_state
    @history.record(self, event)
  end
  # endregion
end

# region: Order#handle:pendiente
class Pending
  def on(event) = { pagar: Paid.new, cancelar: Cancelled.new }[event]
end
# endregion

# region: Order#handle:pagado
class Paid
  def on(event) = { preparar: Preparing.new, cancelar: Cancelled.new }[event]
end
# endregion

# region: Order#handle:preparando
class Preparing
  def on(event) = { entregar: Delivered.new }[event]
end
# endregion

# region: Order#handle:entregado
class Delivered
  def on(_event) = nil # un pedido entregado ya no cambia
end
# endregion

# region: Order#handle:cancelado
class Cancelled
  def on(_event) = nil
end
# endregion
