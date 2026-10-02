class OrderFlow
  def initialize(branch, barista)
    @branch = branch
    @barista = barista
  end

  # Cada sucursal nueva obliga a abrir el flujo que comparten todas.
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
    # region: OrderFlow#create_drink:puerto
    elsif @branch == :puerto # ← nuevo: OrderFlow modificado
      IcedTea.new
    # endregion
    # region: OrderFlow#create_drink:else
    else
      Latte.new # Montaña sigue recibiendo lattes
    # endregion
    end
  end
  # endregion

  def take(order) = @barista.prepare(create_drink)
end
