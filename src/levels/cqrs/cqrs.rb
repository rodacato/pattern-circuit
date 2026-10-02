# Escribir y leer por caminos distintos.
class PlaceOrder
  # Lado de escritura: valida reglas del negocio, una orden a la vez.
  # region: PlaceOrder#call
  def call(command)
    raise InvalidOrder unless command.valid? # reglas del negocio, solo en el lado de escritura
    order = Order.create!(command.attributes)
    @events.publish(:order_placed, order)
  end
  # endregion
end

# region: BoardProjection#on_order_placed
class BoardProjection
  # Cada cambio actualiza una vista ya lista para leer.
  def on_order_placed(order) = @board_view.upsert(order.summary)
end
# endregion

# region: BoardQuery#call
class BoardQuery
  # Lado de lectura: una tabla plana, sin joins ni bloqueos. Rápida y sin fila.
  def call = @board_view.all
end
# endregion
