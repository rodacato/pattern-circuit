class OrderFlow {
  constructor(
    private branch: string,
    private barista: Barista,
  ) {}

  // The shared flow knows every concrete drink of every branch.
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
      return new Latte() // Mountain? Nobody planned for it: it gets a latte
    // endregion
    }
  }
  // endregion

  take(order: Order) { this.barista.prepare(this.createDrink()) }
}
