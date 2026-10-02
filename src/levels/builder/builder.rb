class InvalidOrder < StandardError; end

class OrderBuilder
  # Every step has a name: impossible to put the syrup where the milk goes.
  # region: OrderBuilder#size
  def size(value) = tap { @size = value }
  # endregion

  # region: OrderBuilder#milk
  def milk(value) = tap { @milk = value }
  # endregion

  # region: OrderBuilder#extras
  def syrup(value) = tap { @syrup = value }
  def shots(count) = tap { @shots = count }
  def hot = tap { @temp = :hot }
  def iced = tap { @ice = true }
  # endregion

  # Validates the whole order before it exists: the impossible never even reaches the register.
  # region: OrderBuilder#build
  def build
    raise InvalidOrder, "hot and iced is not possible" if @temp == :hot && @ice
    Order.new(size: @size, milk: @milk, syrup: @syrup, shots: @shots, temp: @temp, ice: @ice)
  end
  # endregion
end

class OrderTaker
  def initialize(cashier, counter)
    @cashier = cashier
    @counter = counter
  end

  # region: OrderTaker#take
  def take(request)
    order = OrderBuilder.new.size(:large).milk(:oat).syrup(:vanilla).shots(2).hot.build
    @cashier.charge(order)
  rescue InvalidOrder => e
    @counter.notify(e.message)
  end
  # endregion
end
