# --- the rest of the coffee shop ---
class Cashier
  def initialize(barista) = @barista = barista

  # region: Cashier#charge
  def charge(order)
    CardTerminal.charge(order.total)
    @barista.prepare(order)
  end
  # endregion
end

class Barista
  def initialize(counter) = @counter = counter

  # The kitchen is the last place to find out an order was impossible: it was already charged.
  # region: Barista#prepare
  def prepare(order)
    raise "Ice in a boiling drink?" if order.hot? && order.ice?
    @counter.hand_over(order)
  end
  # endregion
end

class Counter
  # region: Counter#hand_over
  def hand_over(order) = puts("#{order.name} ready!")
  # endregion

  # region: Counter#notify
  def notify(message) = puts("Before charging: #{message}")
  # endregion
end
