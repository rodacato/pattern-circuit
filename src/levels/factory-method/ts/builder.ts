class DrinkBuilder {
  private _size?: string
  private _temperature?: string

  // region: DrinkBuilder#size
  size(value: string) { this._size = value; return this }
  // endregion
  // region: DrinkBuilder#temperature
  temperature(value: string) { this._temperature = value; return this }
  // endregion

  build() { return { size: this._size, temperature: this._temperature } }
}

class OrderFlow {
  constructor(
    private branch: string,
    private barista: Barista,
  ) {}

  // El Builder arma los detalles… pero la decisión de qué bebida crear sigue aquí.
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
      return new Latte()
    // endregion
    }
  }
  // endregion

  take(order: Order) { this.barista.prepare(this.createDrink()) }
}
