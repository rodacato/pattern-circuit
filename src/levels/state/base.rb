class Order
  attr_reader :status

  def initialize = @status = :pending

  # Each event changes the status without asking if it makes sense.
  # The rules are scattered across ifs, in every method… when someone remembers.
  # region: Order#handle
  def handle(event)
    case event
    when :pay then @status = :paid
    when :prepare then @status = :preparing # what if it isn't paid?
    when :deliver then @status = :delivered  # what if it isn't prepared?
    when :cancel then @status = :cancelled  # what if it was already delivered?
    end
    @history.record(self, event)
  end
  # endregion
end
