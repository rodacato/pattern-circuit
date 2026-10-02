class TicketCounter
  def initialize = @last = 0

  # region: TicketCounter#next
  def next = @last += 1
  # endregion
end

class Register
  # La caja elige una estrategia de numeración… y cada estrategia lleva su propia cuenta.
  def initialize(display, numbering = TicketCounter.new)
    @display = display
    @numbering = numbering
  end

  # region: Register#checkout
  def checkout(order)
    order.ticket = @numbering.next
    @display.show(order)
  end
  # endregion
end
