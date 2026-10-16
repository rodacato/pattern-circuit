class Order
  def initialize(notifier) = @notifier = notifier

  # Strategy picks ONE way to notify: display, or push, or loyalty.
  # region: Order#complete!
  def complete!
    @status = :ready
    @notifier.update(self)
  end
  # endregion
end
