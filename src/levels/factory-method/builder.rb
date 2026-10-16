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

  # The Builder assembles the details… but the decision of which drink to create is still here.
  # region: OrderFlow#create_drink
  def create_drink
    # region: OrderFlow#create_drink:downtown
    if @branch == :downtown
      Latte.new
    # endregion
    # region: OrderFlow#create_drink:beach
    elsif @branch == :beach
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
