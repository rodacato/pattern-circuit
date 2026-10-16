# Producers publish to the bus; consumers subscribe to the bus. Nobody knows each other.
class EventBus
  # region: EventBus#publish
  def publish(event) = @subscribers.each { |s| s.on_event(event) }
  # endregion

  def subscribe(subscriber) = (@subscribers ||= []) << subscriber
end

class Orders
  # region: Orders#place
  def place(order) = @bus.publish(order)
  # endregion
end

class Returns
  # region: Returns#process
  def process(return_request) = @bus.publish(return_request)
  # endregion
end

# region: wiring
bus = EventBus.new
[Inventory.new, Billing.new, Loyalty.new, Analytics.new].each { |s| bus.subscribe(s) } # ← one more subscriber, nothing else
# endregion
