// Cada servicio que produce algo llama a mano a cada servicio interesado.
class Orders {
  // region: Orders#place
  place(order: Event) {
    new Inventory().onEvent(order)
    new Billing().onEvent(order)
    new Loyalty().onEvent(order)
    new Analytics().onEvent(order) // ← cambio 1
  }
  // endregion
}

class Returns {
  // Devoluciones copió la lista… y se le olvidó Facturación y Lealtad.
  // region: Returns#process
  process(returnRequest: Event) {
    new Inventory().onEvent(returnRequest)
    new Analytics().onEvent(returnRequest) // ← cambio 2
  }
  // endregion
}
