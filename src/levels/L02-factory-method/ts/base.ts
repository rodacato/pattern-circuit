class OrderFlow {
  constructor(
    private branch: string,
    private barista: Barista,
  ) {}

  // El flujo compartido conoce cada bebida concreta de cada sucursal.
  // region: OrderFlow#create_drink
  createDrink() {
    // region: OrderFlow#create_drink:centro
    if (this.branch === 'centro') {
      return new Latte()
    // endregion
    // region: OrderFlow#create_drink:playa
    } else if (this.branch === 'playa') {
      return new Frappe()
    // endregion
    // region: OrderFlow#create_drink:else
    } else {
      return new Latte() // ¿Montaña? Nadie la contempló: le toca un latte
    // endregion
    }
  }
  // endregion

  take(order: Order) { this.barista.prepare(this.createDrink()) }
}
