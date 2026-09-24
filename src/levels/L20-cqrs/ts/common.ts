// --- quienes leen y quienes escriben ---
class OrderBoard {
  // region: OrderBoard#show
  show(orders: OrderSummary[]) { render(orders) } // las pantallas preguntan todo el tiempo
  // endregion
}

class Counter {
  // region: Counter#saved
  saved(order: Order) { console.log(`Pedido ${order.id} registrado`) }
  // endregion
}
