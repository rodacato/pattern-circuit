# Un bus para un solo suscriptor: para saber qué pasa tras cobrar hay que buscar quién se suscribió.
class EventBus
  def initialize = @handlers = Hash.new { |h, k| h[k] = [] }
  def subscribe(event, &handler) = @handlers[event] << handler

  # region: EventBus#publish
  def publish(event, payload) = @handlers[event].each { |h| h.call(payload) }
  # endregion
end

class Cashier
  def initialize(bus) = @bus = bus

  # region: Cashier#charge
  def charge(order)
    CardTerminal.charge(order)
    @bus.publish(:order_paid, order)
  end
  # endregion
end

# region: wiring
bus = EventBus.new
kitchen = Kitchen.new(Counter.new)
bus.subscribe(:order_paid) { |order| kitchen.start(order) }
OrderTaker.new(Cashier.new(bus)).take(:latte)
# endregion
