class TicketCounter
  def initialize = @last = 0

  # region: TicketCounter#next
  def next = @last += 1
  # endregion
end

class Register
  # The register picks a numbering strategy… and each strategy keeps its own count.
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
