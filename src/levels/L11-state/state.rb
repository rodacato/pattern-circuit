# Cada estado es un objeto que sabe qué eventos acepta y a qué estado lleva.
class Order
  attr_accessor :state

  def initialize = @state = Pending.new

  def status = @state.name

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
  def name = :pendiente
  def on(event) = { pagar: Paid.new, cancelar: Cancelled.new }[event]
end
# endregion

# region: Order#handle:pagado
class Paid
  def name = :pagado
  def on(event) = { preparar: Preparing.new, cancelar: Cancelled.new }[event]
end
# endregion

# region: Order#handle:preparando
class Preparing
  def name = :preparando
  def on(event) = { entregar: Delivered.new }[event]
end
# endregion

# region: Order#handle:entregado
class Delivered
  def name = :entregado
  def on(_event) = nil # un pedido entregado ya no cambia
end
# endregion

# region: Order#handle:cancelado
class Cancelled
  def name = :cancelado
  def on(_event) = nil
end
# endregion
