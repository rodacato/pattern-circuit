class CounterFactory
  # region: CounterFactory#create
  def create = TicketCounter.new # a new counter on every order: always ticket 1
  # endregion
end

class TicketCounter
  def initialize = @last = 0
  def next = @last += 1
end

class Register
  def initialize(display) = @display = display

  # region: Register#checkout
  def checkout(order)
    order.ticket = CounterFactory.new.create.next
    @display.show(order)
  end
  # endregion
end
