class Order {
  // Nueve argumentos posicionales: nada impide cruzar la leche con el jarabe.
  // region: Order#initialize
  constructor(
    private size: string, private milk: string, private shots: number, private syrup: string,
    private temp: string, private ice: boolean, private cup: string | null, public name: string, private toGo: boolean | null,
  ) {}
  // endregion
}

class OrderTaker {
  constructor(private cashier: Cashier) {}

  // region: OrderTaker#take
  take(request: OrderRequest) {
    const order = new Order('grande', 'vainilla', 2, 'avena', 'caliente', false, null, 'Ana', null)
    //                                ^ leche y jarabe cruzados, y nadie se queja
    this.cashier.charge(order)
  }
  // endregion
}
