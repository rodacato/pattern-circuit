# --- the rest of the coffee shop does not change in this level ---
Order = Struct.new(:drink, :payment, :total)

class OrderTaker
  def initialize(cashier) = @cashier = cashier

  # region: OrderTaker#take
  def take(drink, payment:)
    @cashier.charge(Order.new(drink, payment, 45))
  end
  # endregion
end

class Barista
  def initialize(counter) = @counter = counter

  # region: Barista#prepare
  def prepare(order)
    @counter.hand_over(order)
  end
  # endregion
end

class Counter
  # region: Counter#hand_over
  def hand_over(order) = puts("#{order.drink} ready!")
  # endregion
end
