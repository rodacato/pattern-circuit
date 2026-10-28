class LoyaltyCards
  def initialize = @cards = {}

  # region: LoyaltyCards#find
  def find(customer) = @cards.fetch(customer.id) { NullCard.new }
  # endregion
end

# Responds to everything a card responds to, doing nothing. Nobody needs to ask "is it nil?".
# region: NullCard
class NullCard
  def add_points(_amount) = nil
  def discount = 0
  def masked_number = "no card"
end
# endregion
