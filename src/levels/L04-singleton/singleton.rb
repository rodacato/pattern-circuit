class TicketCounter
  # Una sola instancia para toda la cafetería.
  def self.instance = @instance ||= new
  private_class_method :new

  def initialize = @last = 0

  # region: TicketCounter#next
  def next = @last += 1
  # endregion
end

class Register
  def initialize(display) = @display = display

  # Resuelve el problema… a costa de que cualquier clase pueda llegar al contador global.
  # region: Register#checkout
  def checkout(order)
    order.ticket = TicketCounter.instance.next
    @display.show(order)
  end
  # endregion
end
