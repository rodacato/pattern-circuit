class LoyaltyCards {
  private cards = new Map<string, Card>()

  // region: LoyaltyCards#find
  find(customer: Customer): Card { return this.cards.get(customer.id) ?? new NullCard() }
  // endregion
}

// Responds to everything a card responds to, doing nothing. Nobody needs to ask "is it undefined?".
// region: NullCard
class NullCard implements Card {
  addPoints(_amount: number) {}
  get discount() { return 0 }
  get maskedNumber() { return 'no card' }
}
// endregion
