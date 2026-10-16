# --- who orders and who confirms ---
class WebApp
  # region: WebApp#checkout
  def checkout(params) = @orders.place(params)
  # endregion
end

class Receipt
  # region: Receipt#confirm
  def confirm(order) = puts("Order #{order.id} confirmed")
  # endregion
end
