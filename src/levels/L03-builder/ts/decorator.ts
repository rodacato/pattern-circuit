class Order {
  // region: Order#initialize
  constructor(private size: string, private temp: string) {}
  // endregion
}

// Los extras se apilan como envolturas con nombre: ya no se cruzan.
// region: WithMilk
class WithMilk {
  constructor(private inner: Order, private milk: string) {}
}
// endregion

// region: WithSyrup
class WithSyrup {
  constructor(private inner: Order | WithMilk, private syrup: string) {}
}
// endregion

class WithIce {
  constructor(private inner: Order) {}
  isIced() { return true }
}

class OrderTaker {
  constructor(private cashier: Cashier) {}

  // …pero nadie revisa el pedido completo: caliente + hielo pasa y explota en cocina.
  // region: OrderTaker#take
  take(request: OrderRequest) {
    const order = new WithSyrup(new WithMilk(new Order('grande', 'caliente'), 'avena'), 'vainilla')
    this.cashier.charge(order)
  }
  // endregion
}
