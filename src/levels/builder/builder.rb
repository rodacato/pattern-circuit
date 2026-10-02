class InvalidOrder < StandardError; end

class OrderBuilder
  # Cada paso tiene nombre: imposible poner el jarabe donde va la leche.
  # region: OrderBuilder#size
  def size(value) = tap { @size = value }
  # endregion

  # region: OrderBuilder#milk
  def milk(value) = tap { @milk = value }
  # endregion

  # region: OrderBuilder#extras
  def syrup(value) = tap { @syrup = value }
  def shots(count) = tap { @shots = count }
  def hot = tap { @temp = :caliente }
  def iced = tap { @ice = true }
  # endregion

  # Valida el pedido completo antes de que exista: lo imposible no llega ni a la caja.
  # region: OrderBuilder#build
  def build
    raise InvalidOrder, "caliente y con hielo no se puede" if @temp == :caliente && @ice
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
    order = OrderBuilder.new.size(:grande).milk(:avena).syrup(:vainilla).shots(2).hot.build
    @cashier.charge(order)
  rescue InvalidOrder => e
    @counter.notify(e.message)
  end
  # endregion
end
