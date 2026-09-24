class Order {
  status = 'pendiente'
  private history = new History()

  // Cada evento cambia el status sin preguntar si tiene sentido.
  // Las reglas viven repartidas en ifs, en cada método… cuando alguien se acuerda.
  // region: Order#handle
  handle(event: string) {
    switch (event) {
      case 'pagar': this.status = 'pagado'; break
      case 'preparar': this.status = 'preparando'; break // ¿y si no está pagado?
      case 'entregar': this.status = 'entregado'; break  // ¿y si no está preparado?
      case 'cancelar': this.status = 'cancelado'; break  // ¿y si ya se entregó?
    }
    this.history.record(this, event)
  }
  // endregion
}
