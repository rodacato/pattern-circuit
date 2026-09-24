class Order
  def initialize(first_handler) = @handler = first_handler

  # En una cadena, el primero que atiende se queda con el aviso: los demás nunca se enteran.
  # region: Order#complete!
  def complete!
    @status = :listo
    @handler.handle(self)
  end
  # endregion
end
