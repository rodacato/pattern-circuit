class Order {
  private status = 'pendiente'

  constructor(
    private display: Display,
    private push: PushNotifier,
  ) {}

  // Order conoce a cada interesado por nombre… y nadie se acordó de Lealtad.
  // region: Order#complete!
  complete() {
    this.status = 'listo'
    this.display.update(this)
    this.push.update(this)
  }
  // endregion
}
