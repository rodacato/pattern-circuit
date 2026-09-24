// Un solo interesado: Cashier lo llama directo y el flujo se lee de corrido.
class Cashier {
  constructor(private kitchen: Kitchen) {}

  // region: Cashier#charge
  charge(order: Order) {
    CardTerminal.charge(order)
    this.kitchen.start(order)
  }
  // endregion
}

// region: wiring
new OrderTaker(new Cashier(new Kitchen(new Counter()))).take('latte')
// endregion
