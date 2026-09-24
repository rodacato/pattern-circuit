class Order {
  private status = 'pendiente'

  constructor(private notifier: Subscriber) {}

  // Strategy elige UNA forma de avisar: pantalla, o push, o lealtad.
  // region: Order#complete!
  complete() {
    this.status = 'listo'
    this.notifier.update(this)
  }
  // endregion
}
