class OrderFlow
  def initialize(branch, barista)
    @branch = branch
    @barista = barista
  end

  # El flujo compartido conoce cada bebida concreta de cada sucursal.
  # region: OrderFlow#create_drink
  def create_drink
    # region: OrderFlow#create_drink:centro
    if @branch == :centro
      Latte.new
    # endregion
    # region: OrderFlow#create_drink:playa
    elsif @branch == :playa
      Frappe.new
    # endregion
    # region: OrderFlow#create_drink:else
    else
      Latte.new # ¿Montaña? Nadie la contempló: le toca un latte
    # endregion
    end
  end
  # endregion

  def take(order) = @barista.prepare(create_drink)
end
