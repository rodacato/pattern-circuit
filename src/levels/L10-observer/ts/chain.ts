interface Handler {
  handle(order: Order): void
}

class Order {
  private status = 'pendiente'

  constructor(private handler: Handler) {}

  // En una cadena, el primero que atiende se queda con el aviso: los demás nunca se enteran.
  // region: Order#complete!
  complete() {
    this.status = 'listo'
    this.handler.handle(this)
  }
  // endregion
}
