class LoyaltyCards {
  private cards = new Map<string, Card>()

  // region: LoyaltyCards#find
  find(customer: Customer): Card { return this.cards.get(customer.id) ?? new NullCard() }
  // endregion
}

// Responde a todo lo que responde una tarjeta, sin hacer nada. Nadie necesita preguntar "¿es undefined?".
// region: NullCard
class NullCard implements Card {
  addPoints(_amount: number) {}
  get discount() { return 0 }
  get maskedNumber() { return 'sin tarjeta' }
}
// endregion
