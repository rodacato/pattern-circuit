
// A stand-in for the card that loads the real one on use… and the real one doesn't exist.
// region: LazyCard
class LazyCard {
  constructor(private customer: Customer) {}
  private get real() { return new LoyaltyCards().find(this.customer)! }
  addPoints(amount: number) { this.real.addPoints(amount) }
  get discount() { return this.real.discount }
  get maskedNumber() { return this.real.maskedNumber }
}
// endregion
