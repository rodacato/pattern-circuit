class Order {
  // Nine positional arguments: nothing stops you from swapping the milk and the syrup.
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
    const order = new Order('large', 'vanilla', 2, 'oat', 'hot', false, null, 'Ana', null)
    //                                ^ milk and syrup swapped, and nobody complains
    this.cashier.charge(order)
  }
  // endregion
}
