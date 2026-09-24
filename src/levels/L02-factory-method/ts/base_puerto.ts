class OrderFlow {
  constructor(
    private branch: string,
    private barista: Barista,
  ) {}

  // Cada sucursal nueva obliga a abrir el flujo que comparten todas.
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
    // region: OrderFlow#create_drink:puerto
    } else if (this.branch === 'puerto') { // ← nuevo: OrderFlow modificado
      return new IcedTea()
    // endregion
    // region: OrderFlow#create_drink:else
    } else {
      return new Latte() // Montaña sigue recibiendo lattes
    // endregion
    }
  }
  // endregion

  take(order: Order) { this.barista.prepare(this.createDrink()) }
}
