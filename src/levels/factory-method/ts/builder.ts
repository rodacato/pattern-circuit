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

  // The Builder assembles the details… but the decision of which drink to create is still here.
  // region: OrderFlow#create_drink
  createDrink() {
    // region: OrderFlow#create_drink:downtown
    if (this.branch === 'downtown') {
      return new Latte()
    // endregion
    // region: OrderFlow#create_drink:beach
    } else if (this.branch === 'beach') {
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
