class LoyaltyCards {
  private cards = new Map<string, Card>()

  // If the customer has no card, it returns undefined… and every later use blows up:
  // TypeError: Cannot read properties of undefined (reading 'addPoints')
  // region: LoyaltyCards#find
  find(customer: Customer) { return this.cards.get(customer.id) }
  // endregion
}
