// Cada productor es un sujeto con su propia lista de suscriptores… y las listas no coinciden.
class Orders {
  private subscribers: Subscriber[] = []

  // region: Orders#place
  place(order: Event) { this.subscribers.forEach((s) => s.onEvent(order)) } // Inventario, Facturación, Lealtad
  // endregion
}

class Returns {
  private subscribers: Subscriber[] = []

  // region: Returns#process
  process(returnRequest: Event) { this.subscribers.forEach((s) => s.onEvent(returnRequest)) } // solo Inventario
  // endregion
}
