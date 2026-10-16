class Order {
  private status = 'pending'

  constructor(
    private display: Display,
    private push: PushNotifier,
  ) {}

  // Order knows each interested party by name… and nobody remembered Loyalty.
  // region: Order#complete!
  complete() {
    this.status = 'ready'
    this.display.update(this)
    this.push.update(this)
  }
  // endregion
}
