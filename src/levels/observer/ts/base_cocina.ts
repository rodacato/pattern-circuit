class Order {
  private status = 'pendiente'

  constructor(
    private display: Display,
    private push: PushNotifier,
    private kitchen: Kitchen, // ← otro interesado, otra dependencia
  ) {}

  // region: Order#complete!
  complete() {
    this.status = 'listo'
    this.display.update(this)
    this.push.update(this)
    this.kitchen.update(this) // ← Order modificado otra vez
  }
  // endregion
}
