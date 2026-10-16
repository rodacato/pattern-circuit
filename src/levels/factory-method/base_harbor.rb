class OrderFlow
  def initialize(branch, barista)
    @branch = branch
    @barista = barista
  end

  # Every new branch forces us to open the flow they all share.
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
    # region: OrderFlow#create_drink:harbor
    elsif @branch == :harbor # ← new: OrderFlow modified
      IcedTea.new
    # endregion
    # region: OrderFlow#create_drink:else
    else
      Latte.new # Mountain still gets lattes
    # endregion
    end
  end
  # endregion

  def take(order) = @barista.prepare(create_drink)
end
