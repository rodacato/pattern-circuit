class LoyaltyCards
  # region: LoyaltyCards#find
  def find(customer) = @cards.fetch(customer.id) { NullCard.new }
  # endregion
end

# Responde a todo lo que responde una tarjeta, sin hacer nada. Nadie necesita preguntar "¿es nil?".
# region: NullCard
class NullCard
  def add_points(_amount) = nil
  def discount = 0
  def masked_number = "sin tarjeta"
end
# endregion
