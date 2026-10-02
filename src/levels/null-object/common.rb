# --- who uses the customer's card ---
class Loyalty
  # region: Loyalty#reward
  def reward(order) = order.card.add_points(order.total)
  # endregion
end

class Discounts
  # region: Discounts#apply
  def apply(order) = order.total -= order.card.discount
  # endregion
end

class Receipt
  # region: Receipt#print
  def print(order) = puts("Card: #{order.card.masked_number}")
  # endregion
end

class Counter
  # region: Counter#hand_over
  def hand_over(order) = puts("Ready!")
  # endregion
end
