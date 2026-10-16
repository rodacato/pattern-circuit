// --- who orders and who confirms ---
class WebApp {
  constructor(private orders: OrderService) {}

  // region: WebApp#checkout
  checkout(params: OrderParams) { return this.orders.place(params) }
  // endregion
}

class Receipt {
  // region: Receipt#confirm
  confirm(order: Order) { console.log(`Order ${order.id} confirmed`) }
  // endregion
}
