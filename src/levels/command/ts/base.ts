class FrontDesk {
  constructor(private barista: Barista) {}

  // Cada pedido se ejecuta en el acto: no queda nada que se pueda deshacer.
  // region: FrontDesk#submit
  submit(request: OrderRequest) {
    // region: FrontDesk#submit:cmd:pedir
    switch (request.action) {
      case 'pedir': this.barista.prepare(request.drink); break
    // endregion
    // region: FrontDesk#submit:cmd:cancelar
      case 'cancelar': new Undo().call(request); break
    // endregion
    }
  }
  // endregion
}

// region: Undo#call
class Undo {
  call(request: OrderRequest) { throw new Error('¿Deshacer qué? El café ya se está haciendo') }
}
// endregion
