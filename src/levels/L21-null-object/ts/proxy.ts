
// Un sustituto de la tarjeta que carga la real al usarla… y la real no existe.
// region: LazyCard
class LazyCard {
  constructor(private customer: Customer) {}
  private get real() { return new LoyaltyCards().find(this.customer)! }
  addPoints(amount: number) { this.real.addPoints(amount) }
  get discount() { return this.real.discount }
  get maskedNumber() { return this.real.maskedNumber }
}
// endregion
