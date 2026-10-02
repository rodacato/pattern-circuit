class FrontDesk {
  constructor(private barista: Barista) {}

  // Each order runs on the spot: there is nothing left to undo.
  // region: FrontDesk#submit
  submit(request: OrderRequest) {
    // region: FrontDesk#submit:cmd:order
    switch (request.action) {
      case 'order': this.barista.prepare(request.drink); break
    // endregion
    // region: FrontDesk#submit:cmd:cancel
      case 'cancel': new Undo().call(request); break
    // endregion
    }
  }
  // endregion
}

// region: Undo#call
class Undo {
  call(request: OrderRequest) { throw new Error('Undo what? The coffee is already being made') }
}
// endregion
