// Una estrategia por evento… pero ninguna recuerda en qué estado está el pedido.
class Order {
  status = 'pendiente'
  private history = new History()

  static HANDLERS: Record<string, new () => { apply(): string }> = {
    pagar: PayHandler, preparar: PrepareHandler, entregar: DeliverHandler, cancelar: CancelHandler,
  }

  // region: EventHandlers
  handle(event: string) {
    this.status = new Order.HANDLERS[event]().apply() // siempre aplica, pase lo que pase
    this.history.record(this, event)
  }
  // endregion
}
