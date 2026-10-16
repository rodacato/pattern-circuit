# A bus for a single subscriber: to know what happens after charging you have to look up who subscribed.
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
