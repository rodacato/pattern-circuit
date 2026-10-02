# --- quienes leen y quienes escriben ---
class OrderBoard
  # region: OrderBoard#show
  def show(orders) = render(orders) # las pantallas preguntan todo el tiempo
  # endregion
end

class Counter
  # region: Counter#saved
  def saved(order) = puts("Pedido #{order.id} registrado")
  # endregion
end
