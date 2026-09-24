
# Una ventanilla única delante del almacén: todos pasan por ella hacia la misma fila.
# region: OrdersDesk
class OrdersDesk
  def handle(request) = OrderStore.new.handle(request)
end
# endregion
