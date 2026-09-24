# --- productos y el resto de la cafetería ---
# region: Latte
class Latte; end
# endregion
# region: Frappe
class Frappe; end
# endregion
# region: HotChocolate
class HotChocolate; end
# endregion
# region: IcedTea
class IcedTea; end
# endregion

class OrderTaker
  def initialize(branches) = @branches = branches

  # region: OrderTaker#take
  def take(order)
    @branches.fetch(order.branch).take(order)
  end
  # endregion
end

class Barista
  def initialize(counter) = @counter = counter

  # region: Barista#prepare
  def prepare(drink)
    @counter.hand_over(drink)
  end
  # endregion
end

class Counter
  # region: Counter#hand_over
  def hand_over(drink) = puts("¡#{drink.class.name} listo!")
  # endregion
end
