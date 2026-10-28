class LoyaltyCards
  def initialize = @cards = {}

  # If the customer has no card, it returns nil… and every later use blows up:
  # NoMethodError: undefined method 'add_points' for nil
  # region: LoyaltyCards#find
  def find(customer) = @cards[customer.id]
  # endregion
end
