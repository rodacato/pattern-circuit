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

class DowntownBranch < Branch
  # region: DowntownBranch#create_drink
  def create_drink = Latte.new
  # endregion
end

class BeachBranch < Branch
  # region: BeachBranch#create_drink
  def create_drink = Frappe.new
  # endregion
end

class MountainBranch < Branch
  # region: MountainBranch#create_drink
  def create_drink = HotChocolate.new
  # endregion
end

# region: HarborBranch#create_drink
class HarborBranch < Branch # ← sucursal nueva: una subclase, nada más
  def create_drink = IcedTea.new
end
# endregion
