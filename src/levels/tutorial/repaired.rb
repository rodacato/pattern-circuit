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
    puts "Cobrado: #{order.drink}"
    @barista.prepare(order)
  end
  # endregion
end

class Barista
  def initialize(counter) = @counter = counter

  # region: Barista#prepare
  def prepare(order)
    puts "Preparando #{order.drink}..."
    @counter.hand_over(order)
  end
  # endregion
end

class Counter
  # region: Counter#hand_over
  def hand_over(order)
    puts "¡#{order.drink} listo!"
  end
  # endregion
end

# region: wiring
# Cada `new` es un cable: así se ve el circuito en código.
taker = OrderTaker.new(Cashier.new(Barista.new(Counter.new)))
taker.take(:espresso)
# endregion
