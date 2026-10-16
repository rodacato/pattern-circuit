Order = Struct.new(:drink)

class OrderTaker
  def initialize(cashier) = @cashier = cashier

  # region: OrderTaker#take
  def take(drink)
    @cashier.charge(Order.new(drink))
  end
  # endregion
end

class Cashier
  def initialize(barista) = @barista = barista

  # region: Cashier#charge
  def charge(order)
    puts "Charged: #{order.drink}"
    @barista.prepare(order)
  end
  # endregion
end

class Barista
  def initialize(counter) = @counter = counter

  # region: Barista#prepare
  def prepare(order)
    puts "Preparing #{order.drink}..."
    @counter.hand_over(order)
  end
  # endregion
end

class Counter
  # region: Counter#hand_over
  def hand_over(order)
    puts "#{order.drink} ready!"
  end
  # endregion
end

# region: wiring
# Each `new` is a wire: this is how the circuit looks in code.
taker = OrderTaker.new(Cashier.new(Barista.new(Counter.new)))
taker.take(:espresso)
# endregion
