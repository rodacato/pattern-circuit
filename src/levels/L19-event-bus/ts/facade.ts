// Cada servicio que produce algo llama a mano a cada servicio interesado.
class Orders {
  // region: Orders#place
  place(order: Event) {
    new Inventory().onEvent(order)
    new Billing().onEvent(order)
    new Loyalty().onEvent(order)
  }
  // endregion
}

class Returns {
  // Devoluciones copió la lista… y se le olvidó Facturación y Lealtad.
  // region: Returns#process
  process(returnRequest: Event) {
    new Inventory().onEvent(returnRequest)
  }
  // endregion
}

// Una fachada que agrupa los servicios… a la que cada productor sigue llamando con su propia lista.
// region: Services
class Services {
  notify(event: Event, ...targets: Subscriber[]) { targets.forEach((t) => t.onEvent(event)) }
}
// endregion
