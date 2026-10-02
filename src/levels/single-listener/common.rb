# --- el resto de la cafetería no cambia en este nivel ---
Order = Struct.new(:drink)

class OrderTaker
  def initialize(cashier) = @cashier = cashier

  # region: OrderTaker#take
  def take(drink) = @cashier.charge(Order.new(drink))
  # endregion
end

class Kitchen
  def initialize(counter) = @counter = counter

  # region: Kitchen#start
  def start(order) = @counter.hand_over(order)
  # endregion
end

class Counter
  # region: Counter#hand_over
  def hand_over(order) = puts("¡#{order.drink} listo!")
  # endregion
end
