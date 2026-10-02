class TicketCounter
  # One single instance for the whole coffee shop.
  def self.instance = @instance ||= new
  private_class_method :new

  def initialize = @last = 0

  # region: TicketCounter#next
  def next = @last += 1
  # endregion
end

class Register
  def initialize(display) = @display = display

  # Solves the problem… at the cost of any class being able to reach the global counter.
  # region: Register#checkout
  def checkout(order)
    order.ticket = TicketCounter.instance.next
    @display.show(order)
  end
  # endregion
end
