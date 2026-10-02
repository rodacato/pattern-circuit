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
  # region: Barista#prepare
  def prepare(order)
    puts "Preparing #{order.drink}..."
    # and now who do I hand it to? A wire is missing.
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
taker = OrderTaker.new(Cashier.new(Barista.new))
taker.take(:espresso)
# endregion
