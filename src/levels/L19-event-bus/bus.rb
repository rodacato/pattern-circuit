# Los productores publican en el bus; los consumidores se suscriben al bus. Nadie se conoce.
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
[Inventory.new, Billing.new, Loyalty.new].each { |s| bus.subscribe(s) }
# endregion
