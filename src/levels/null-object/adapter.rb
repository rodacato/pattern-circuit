
# Translating the card to another system's format doesn't help when there is no card to translate.
# region: CardAdapter
class CardAdapter
  def initialize(card) = @card = card
  def add_points(amount) = @card.credit_points(amount)
end
# endregion
