class TicketCounter
  def initialize = @last = 0

  # region: TicketCounter#next
  def next = @last += 1
  # endregion
end

class Register
  def initialize(display)
    @display = display
    @counter = TicketCounter.new # cada caja crea su propio contador…
  end

  # …y las dos cajas reparten el turno 1, el 2, el 3… dos veces.
  # region: Register#checkout
  def checkout(order)
    order.ticket = @counter.next
    @display.show(order)
  end
  # endregion
end
