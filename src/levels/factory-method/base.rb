class OrderFlow
  def initialize(branch, barista)
    @branch = branch
    @barista = barista
  end

  # The shared flow knows every concrete drink of every branch.
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
      Latte.new # Mountain? Nobody planned for it: it gets a latte
    # endregion
    end
  end
  # endregion

  def take(order) = @barista.prepare(create_drink)
end
