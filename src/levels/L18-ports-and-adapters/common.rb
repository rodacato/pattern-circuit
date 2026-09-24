# --- quien pide y quien confirma ---
class WebApp
  # region: WebApp#checkout
  def checkout(params) = @orders.place(params)
  # endregion
end

class Receipt
  # region: Receipt#confirm
  def confirm(order) = puts("Pedido #{order.id} confirmado")
  # endregion
end
