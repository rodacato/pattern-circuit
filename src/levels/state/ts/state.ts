// Each state is an object that knows which events it accepts and which state it leads to.
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
  name = 'pending'
  on(event: string) { return ({ pay: new Paid(), cancel: new Cancelled() } as Record<string, State>)[event] }
}
// endregion

// region: Order#handle:pagado
class Paid implements State {
  name = 'paid'
  on(event: string) { return ({ prepare: new Preparing(), cancel: new Cancelled() } as Record<string, State>)[event] }
}
// endregion

// region: Order#handle:preparando
class Preparing implements State {
  name = 'preparing'
  on(event: string) { return ({ deliver: new Delivered() } as Record<string, State>)[event] }
}
// endregion

// region: Order#handle:entregado
class Delivered implements State {
  name = 'delivered'
  on(_event: string) { return undefined } // a delivered order no longer changes
}
// endregion

// region: Order#handle:cancelado
class Cancelled implements State {
  name = 'cancelled'
  on(_event: string) { return undefined }
}
// endregion
