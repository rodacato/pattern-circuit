class InvalidOrder extends Error {}

class OrderBuilder {
  private _size?: string
  private _milk?: string
  private _syrup?: string
  private _shots?: number
  private _temp?: string
  private _ice?: boolean

  // Cada paso tiene nombre: imposible poner el jarabe donde va la leche.
  // region: OrderBuilder#size
  size(value: string) { this._size = value; return this }
  // endregion

  // region: OrderBuilder#milk
  milk(value: string) { this._milk = value; return this }
  // endregion

  // region: OrderBuilder#extras
  syrup(value: string) { this._syrup = value; return this }
  shots(count: number) { this._shots = count; return this }
  hot() { this._temp = 'caliente'; return this }
  iced() { this._ice = true; return this }
  // endregion

  // Valida el pedido completo antes de que exista: lo imposible no llega ni a la caja.
  // region: OrderBuilder#build
  build() {
    if (this._temp === 'caliente' && this._ice) throw new InvalidOrder('caliente y con hielo no se puede')
    return new Order({ size: this._size, milk: this._milk, syrup: this._syrup, shots: this._shots, temp: this._temp, ice: this._ice })
  }
  // endregion
}

class OrderTaker {
  constructor(
    private cashier: Cashier,
    private counter: Counter,
  ) {}

  // region: OrderTaker#take
  take(request: OrderRequest) {
    try {
      const order = new OrderBuilder().size('grande').milk('avena').syrup('vainilla').shots(2).hot().build()
      this.cashier.charge(order)
    } catch (e) {
      if (!(e instanceof InvalidOrder)) throw e
      this.counter.notify(e.message)
    }
  }
  // endregion
}
