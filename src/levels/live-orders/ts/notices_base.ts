class OrderUpdates {
  constructor(
    private display: Display,
    private push: PushNotifier,
  ) {}

  // The updates know each interested party by name… and nobody remembered Loyalty.
  // region: OrderUpdates#publish
  publish(order: Order) {
    this.display.update(order)
    this.push.update(order)
  }
  // endregion
}
