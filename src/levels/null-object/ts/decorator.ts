// Envolver undefined no lo convierte en una tarjeta: el envoltorio delega… a undefined.
// region: CardLogger
class CardLogger {
  constructor(private inner: Card | undefined) {}
  addPoints(amount: number) { this.inner!.addPoints(amount) }
  get discount() { return this.inner!.discount }
  get maskedNumber() { return this.inner!.maskedNumber }
}
// endregion
