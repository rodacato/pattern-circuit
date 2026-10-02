class Order
  def initialize = @subscribers = []

  # Anyone can subscribe; Order doesn't know who they are.
  def subscribe(subscriber) = @subscribers << subscriber

  # region: Order#complete!
  def complete!
    @status = :ready
    @subscribers.each { |s| s.update(self) }
  end
  # endregion
end

# region: wiring
order = Order.new
[Display.new, PushNotifier.new, LoyaltyProgram.new, Kitchen.new].each { |s| order.subscribe(s) } # ← just one more subscription
# endregion
