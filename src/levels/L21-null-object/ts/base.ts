class LoyaltyCards {
  private cards = new Map<string, Card>()

  // Si el cliente no tiene tarjeta, devuelve undefined… y cada uso posterior explota:
  // TypeError: Cannot read properties of undefined (reading 'addPoints')
  // region: LoyaltyCards#find
  find(customer: Customer) { return this.cards.get(customer.id) }
  // endregion
}
