# --- el resto de la cafetería ---
class OrderTaker
  def initialize(menu, barista)
    @menu = menu
    @barista = barista
  end

  # region: OrderTaker#take
  def take(request) = @barista.prepare(@menu.drink_for(request))
  # endregion
end

class Barista
  def initialize(counter) = @counter = counter

  # region: Barista#prepare
  def prepare(drink) = @counter.hand_over(drink)
  # endregion
end

class Counter
  # region: Counter#hand_over
  def hand_over(drink) = puts("#{drink.description}: $#{drink.cost}")
  # endregion
end
