class Order
  def initialize(notifier) = @notifier = notifier

  # Strategy elige UNA forma de avisar: pantalla, o push, o lealtad.
  # region: Order#complete!
  def complete!
    @status = :listo
    @notifier.update(self)
  end
  # endregion
end
