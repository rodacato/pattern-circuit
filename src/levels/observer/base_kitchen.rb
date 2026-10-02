class Order
  def initialize(display, push, kitchen)
    @display = display
    @push = push
    @kitchen = kitchen # ← another interested party, another dependency
  end

  # region: Order#complete!
  def complete!
    @status = :ready
    @display.update(self)
    @push.update(self)
    @kitchen.update(self) # ← Order modified again
  end
  # endregion
end
