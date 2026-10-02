// --- quien pide y quien confirma ---
class WebApp {
  constructor(private orders: OrderService) {}

  // region: WebApp#checkout
  checkout(params: OrderParams) { return this.orders.place(params) }
  // endregion
}

class Receipt {
  // region: Receipt#confirm
  confirm(order: Order) { console.log(`Pedido ${order.id} confirmado`) }
  // endregion
}
