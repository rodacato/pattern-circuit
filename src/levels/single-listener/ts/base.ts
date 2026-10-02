// Solo la cocina necesita saber que se cobró un pedido… y nadie le avisa.
class Cashier {
  // region: Cashier#charge
  charge(order: Order) {
    CardTerminal.charge(order)
    // ¿y la cocina? El pedido se queda esperando.
  }
  // endregion
}

// region: wiring
new OrderTaker(new Cashier()).take('latte')
// endregion
