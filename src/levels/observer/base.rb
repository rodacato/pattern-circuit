class Order
  def initialize(display, push)
    @display = display
    @push = push
  end

  # Order knows each interested party by name… and nobody remembered Loyalty.
  # region: Order#complete!
  def complete!
    @status = :ready
    @display.update(self)
    @push.update(self)
  end
  # endregion
end
