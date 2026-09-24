// Command convierte la llamada en un objeto… que nadie encola, deshace ni registra.
class StartOrder {
  constructor(
    private kitchen: Kitchen,
    private order: Order,
  ) {}

  // region: StartOrder#call
  call() { this.kitchen.start(this.order) }
  // endregion
}

class Cashier {
  constructor(private kitchen: Kitchen) {}

  // region: Cashier#charge
  charge(order: Order) {
    CardTerminal.charge(order)
    new StartOrder(this.kitchen, order).call()
  }
  // endregion
}

// region: wiring
new OrderTaker(new Cashier(new Kitchen(new Counter()))).take('latte')
// endregion
