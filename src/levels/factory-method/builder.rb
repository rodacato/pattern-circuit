class DrinkBuilder
  # region: DrinkBuilder#size
  def size(value) = tap { @size = value }
  # endregion
  # region: DrinkBuilder#temperature
  def temperature(value) = tap { @temperature = value }
  # endregion

  def build = { size: @size, temperature: @temperature }
end

class OrderFlow
  def initialize(branch, barista)
    @branch = branch
    @barista = barista
  end

  # El Builder arma los detalles… pero la decisión de qué bebida crear sigue aquí.
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
      Latte.new
    # endregion
    end
  end
  # endregion

  def take(order) = @barista.prepare(create_drink)
end
