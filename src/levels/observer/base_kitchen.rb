class Order
  def initialize(display, push, kitchen)
    @display = display
    @push = push
    @kitchen = kitchen # ← otro interesado, otra dependencia
  end

  # region: Order#complete!
  def complete!
    @status = :listo
    @display.update(self)
    @push.update(self)
    @kitchen.update(self) # ← Order modificado otra vez
  end
  # endregion
end
