# Each state is an object that knows which events it accepts and which state it leads to.
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
  def name = :pending
  def on(event) = { pay: Paid.new, cancel: Cancelled.new }[event]
end
# endregion

# region: Order#handle:pagado
class Paid
  def name = :paid
  def on(event) = { prepare: Preparing.new, cancel: Cancelled.new }[event]
end
# endregion

# region: Order#handle:preparando
class Preparing
  def name = :preparing
  def on(event) = { deliver: Delivered.new }[event]
end
# endregion

# region: Order#handle:entregado
class Delivered
  def name = :delivered
  def on(_event) = nil # a delivered order no longer changes
end
# endregion

# region: Order#handle:cancelado
class Cancelled
  def name = :cancelled
  def on(_event) = nil
end
# endregion
