// Cada estado es un objeto que sabe qué eventos acepta y a qué estado lleva.
interface State {
  name: string
  on(event: string): State | undefined
}

class Order {
  state: State = new Pending()
  private history = new History()

  get status() { return this.state.name }

  // region: Order#handle
  handle(event: string) {
    const nextState = this.state.on(event)
    if (!nextState) return this.history.reject(this, event)
    this.state = nextState
    this.history.record(this, event)
  }
  // endregion
}

// region: Order#handle:pendiente
class Pending implements State {
  name = 'pendiente'
  on(event: string) { return ({ pagar: new Paid(), cancelar: new Cancelled() } as Record<string, State>)[event] }
}
// endregion

// region: Order#handle:pagado
class Paid implements State {
  name = 'pagado'
  on(event: string) { return ({ preparar: new Preparing(), cancelar: new Cancelled() } as Record<string, State>)[event] }
}
// endregion

// region: Order#handle:preparando
class Preparing implements State {
  name = 'preparando'
  on(event: string) { return ({ entregar: new Delivered() } as Record<string, State>)[event] }
}
// endregion

// region: Order#handle:entregado
class Delivered implements State {
  name = 'entregado'
  on(_event: string) { return undefined } // un pedido entregado ya no cambia
}
// endregion

// region: Order#handle:cancelado
class Cancelled implements State {
  name = 'cancelado'
  on(_event: string) { return undefined }
}
// endregion
