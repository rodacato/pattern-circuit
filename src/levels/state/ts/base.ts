class Order {
  status = 'pending'
  private history = new History()

  // Each event changes the status without asking if it makes sense.
  // The rules are scattered across ifs, in every method… when someone remembers.
  // region: Order#handle
  handle(event: string) {
    switch (event) {
      case 'pay': this.status = 'paid'; break
      case 'prepare': this.status = 'preparing'; break // what if it isn't paid?
      case 'deliver': this.status = 'delivered'; break  // what if it isn't prepared?
      case 'cancel': this.status = 'cancelled'; break  // what if it was already delivered?
    }
    this.history.record(this, event)
  }
  // endregion
}
