class Order
  def initialize(display, push)
    @display = display
    @push = push
  end

  # Order conoce a cada interesado por nombre… y nadie se acordó de Lealtad.
  # region: Order#complete!
  def complete!
    @status = :listo
    @display.update(self)
    @push.update(self)
  end
  # endregion
end
