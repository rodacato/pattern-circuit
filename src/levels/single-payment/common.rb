# --- el resto de la cafetería no cambia en este nivel ---
Order = Struct.new(:drink, :price)

class OrderTaker
  def initialize(cashier) = @cashier = cashier

  # region: OrderTaker#take
  def take(drink, price) = @cashier.charge(Order.new(drink, price))
  # endregion
end

class Barista
  def initialize(counter) = @counter = counter

  # region: Barista#prepare
  def prepare(order) = @counter.hand_over(order)
  # endregion
end

class Counter
  # region: Counter#hand_over
  def hand_over(order) = puts("¡#{order.drink} listo!")
  # endregion
end
