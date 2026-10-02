class Order
  def initialize(first_handler) = @handler = first_handler

  # In a chain, the first one that handles it keeps the notice: the others never find out.
  # region: Order#complete!
  def complete!
    @status = :ready
    @handler.handle(self)
  end
  # endregion
end
