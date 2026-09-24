class Order
  def initialize = @subscribers = []

  # Cualquiera se suscribe; Order no sabe quiénes son.
  def subscribe(subscriber) = @subscribers << subscriber

  # region: Order#complete!
  def complete!
    @status = :listo
    @subscribers.each { |s| s.update(self) }
  end
  # endregion
end

# region: wiring
order = Order.new
[Display.new, PushNotifier.new, LoyaltyProgram.new, Kitchen.new # ← solo una suscripción más].each { |s| order.subscribe(s) }
# endregion
