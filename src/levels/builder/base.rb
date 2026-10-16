class Order
  # Nine positional arguments: nothing stops you from swapping the milk and the syrup.
  # region: Order#initialize
  def initialize(size, milk, shots, syrup, temp, ice, cup, name, to_go)
    @size, @milk, @shots, @syrup = size, milk, shots, syrup
    @temp, @ice, @cup, @name, @to_go = temp, ice, cup, name, to_go
  end
  # endregion
end

class OrderTaker
  def initialize(cashier) = @cashier = cashier

  # region: OrderTaker#take
  def take(request)
    order = Order.new(:large, :vanilla, 2, :oat, :hot, false, nil, "Ana", nil)
    #                          ^ milk and syrup swapped, and nobody complains
    @cashier.charge(order)
  end
  # endregion
end
