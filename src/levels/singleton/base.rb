class TicketCounter
  def initialize = @last = 0

  # region: TicketCounter#next
  def next = @last += 1
  # endregion
end

class Register
  def initialize(display)
    @display = display
    @counter = TicketCounter.new # each register creates its own counter…
  end

  # …and the two registers hand out ticket 1, 2, 3… twice.
  # region: Register#checkout
  def checkout(order)
    order.ticket = @counter.next
    @display.show(order)
  end
  # endregion
end
