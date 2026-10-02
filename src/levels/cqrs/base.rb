# Un solo modelo para todo: las pantallas y el mostrador hacen fila en el mismo lugar.
class OrderStore
  # region: OrderStore#handle
  def handle(request)
    # region: OrderStore#handle:lectura
    if request.read?
      @mutex.synchronize { orders_with_items_and_customers } # consulta pesada, una a la vez
    # endregion
    # region: OrderStore#handle:escritura
    else
      @mutex.synchronize { validate_and_save(request.order) }
    # endregion
    end
  end
  # endregion
end
