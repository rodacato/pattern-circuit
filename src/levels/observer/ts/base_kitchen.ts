class Order {
  private status = 'pending'

  constructor(
    private display: Display,
    private push: PushNotifier,
    private kitchen: Kitchen, // ← another interested party, another dependency
  ) {}

  // region: Order#complete!
  complete() {
    this.status = 'ready'
    this.display.update(this)
    this.push.update(this)
    this.kitchen.update(this) // ← Order modified again
  }
  // endregion
}
