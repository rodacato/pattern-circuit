class OrderUpdates
  def initialize(display, push)
    @display = display
    @push = push
  end

  # The updates know each interested party by name… and nobody remembered Loyalty.
  # region: OrderUpdates#publish
  def publish(order)
    @display.update(order)
    @push.update(order)
  end
  # endregion
end
