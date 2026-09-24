class DrinkFactory {
  private static _instance?: DrinkFactory

  // Una sola fábrica para todas las sucursales.
  static get instance() { return (this._instance ??= new DrinkFactory()) }

  // region: DrinkFactory#create
  create() {
    return new Latte() // la instancia única no sabe de qué sucursal viene el pedido
  }
  // endregion
}

class OrderFlow {
  constructor(private barista: Barista) {}
  take(order: Order) { this.barista.prepare(DrinkFactory.instance.create()) }
}
