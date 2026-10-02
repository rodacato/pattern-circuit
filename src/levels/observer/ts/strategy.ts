class Order {
  private status = 'pending'

  constructor(private notifier: Subscriber) {}

  // Strategy picks ONE way to notify: display, or push, or loyalty.
  // region: Order#complete!
  complete() {
    this.status = 'ready'
    this.notifier.update(this)
  }
  // endregion
}
