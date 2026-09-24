require "delegate"

class Order
  # region: Order#initialize
  def initialize(size, temp) = (@size, @temp = size, temp)
  # endregion
end

# Los extras se apilan como envolturas con nombre: ya no se cruzan.
# region: WithMilk
class WithMilk < SimpleDelegator
  def initialize(order, milk) = (super(order); @milk = milk)
end
# endregion

# region: WithSyrup
class WithSyrup < SimpleDelegator
  def initialize(order, syrup) = (super(order); @syrup = syrup)
end
# endregion

class OrderTaker
  def initialize(cashier) = @cashier = cashier

  # …pero nadie revisa el pedido completo: caliente + hielo pasa y explota en cocina.
  # region: OrderTaker#take
  def take(request)
    order = WithSyrup.new(WithMilk.new(Order.new(:grande, :caliente), :avena), :vainilla)
    @cashier.charge(order)
  end
  # endregion
end
