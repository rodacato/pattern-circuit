
// Translating the card to another system's format doesn't help when there is no card to translate.
// region: CardAdapter
class CardAdapter {
  constructor(private card: ExternalCard) {}
  addPoints(amount: number) { this.card.addPoints(amount) }
}
// endregion
