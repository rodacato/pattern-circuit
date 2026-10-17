class OrderUpdates
  def initialize = @subscribers = []

  # Anyone can subscribe; the updates don't know who they are.
  def subscribe(subscriber) = @subscribers << subscriber

  # region: OrderUpdates#publish
  def publish(order) = @subscribers.each { |s| s.update(order) }
  # endregion
end

# region: wiring
updates = OrderUpdates.new
[Display.new, PushNotifier.new, LoyaltyProgram.new].each { |s| updates.subscribe(s) }
# endregion
