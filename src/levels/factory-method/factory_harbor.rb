class Branch
  def initialize(barista) = @barista = barista

  # The flow is the same for all of them; only `create_drink` changes.
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
class HarborBranch < Branch # ← new branch: one subclass, nothing else
  def create_drink = IcedTea.new
end
# endregion
