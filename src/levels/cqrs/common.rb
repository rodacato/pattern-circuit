# --- who reads and who writes ---
class OrderBoard
  # region: OrderBoard#show
  def show(orders) = render(orders) # the screens ask all the time
  # endregion
end

class Counter
  # region: Counter#saved
  def saved(order) = puts("Order #{order.id} saved")
  # endregion
end
