class Branch
  def initialize(barista) = @barista = barista

  # El flujo es el mismo para todas; solo `create_drink` cambia.
  # region: Branch#take
  def take(order)
    drink = create_drink
    @barista.prepare(drink)
  end
  # endregion

  def create_drink = raise(NotImplementedError)
end

class CentroBranch < Branch
  # region: CentroBranch#create_drink
  def create_drink = Latte.new
  # endregion
end

class PlayaBranch < Branch
  # region: PlayaBranch#create_drink
  def create_drink = Frappe.new
  # endregion
end

class MontanaBranch < Branch
  # region: MontanaBranch#create_drink
  def create_drink = HotChocolate.new
  # endregion
end
