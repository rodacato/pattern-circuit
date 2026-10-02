class LoyaltyCards
  # Si el cliente no tiene tarjeta, devuelve nil… y cada uso posterior explota:
  # NoMethodError: undefined method 'add_points' for nil
  # region: LoyaltyCards#find
  def find(customer) = @cards[customer.id]
  # endregion
end
