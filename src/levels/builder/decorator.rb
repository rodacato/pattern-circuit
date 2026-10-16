require "delegate"

class Order
  # region: Order#initialize
  def initialize(size, temp) = (@size, @temp = size, temp)
  # endregion
end

# Extras stack as named wrappers: they no longer get swapped.
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

class WithIce < SimpleDelegator
  def ice? = true
end

class OrderTaker
  def initialize(cashier) = @cashier = cashier

  # …but nobody checks the whole order: hot + ice gets through and blows up in the kitchen.
  # region: OrderTaker#take
  def take(request)
    order = WithSyrup.new(WithMilk.new(Order.new(:large, :hot), :oat), :vanilla)
    @cashier.charge(order)
  end
  # endregion
end
