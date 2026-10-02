class OrderFlow {
  constructor(
    private branch: string,
    private barista: Barista,
  ) {}

  // Every new branch forces us to open the flow they all share.
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
    // region: OrderFlow#create_drink:harbor
    } else if (this.branch === 'harbor') { // ← new: OrderFlow modified
      return new IcedTea()
    // endregion
    // region: OrderFlow#create_drink:else
    } else {
      return new Latte() // Mountain still gets lattes
    // endregion
    }
  }
  // endregion

  take(order: Order) { this.barista.prepare(this.createDrink()) }
}
