// Wrapping undefined doesn't turn it into a card: the wrapper delegates… to undefined.
// region: CardLogger
class CardLogger {
  constructor(private inner: Card | undefined) {}
  addPoints(amount: number) { this.inner!.addPoints(amount) }
  get discount() { return this.inner!.discount }
  get maskedNumber() { return this.inner!.maskedNumber }
}
// endregion
