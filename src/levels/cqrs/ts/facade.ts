
// Una ventanilla única delante del almacén: todos pasan por ella hacia la misma fila.
// region: OrdersDesk
class OrdersDesk {
  handle(request: Request) { return new OrderStore().handle(request) }
}
// endregion
