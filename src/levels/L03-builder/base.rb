class Order
  # Nueve argumentos posicionales: nada impide cruzar la leche con el jarabe.
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
    order = Order.new(:grande, :vainilla, 2, :avena, :caliente, false, nil, "Ana", nil)
    #                          ^ leche y jarabe cruzados, y nadie se queja
    @cashier.charge(order)
  end
  # endregion
end
