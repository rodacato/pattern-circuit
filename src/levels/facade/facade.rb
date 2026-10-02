# A simple door to the kitchen. Clients no longer know the machines.
class KitchenFacade
  # region: KitchenFacade#latte
  def latte
    ground = Grinder.new.grind(:arabica)
    machine = EspressoMachine.new
    shot = machine.extract(ground)
    milk = MilkFrother.new.froth(:whole)
    Counter.new.hand_over([shot, milk])
  end
  # endregion
end

class FrontDesk
  # region: FrontDesk#make_latte
  def make_latte = KitchenFacade.new.latte
  # endregion
end

class DeliveryApp
  # region: DeliveryApp#make_latte
  def make_latte = KitchenFacade.new.latte
  # endregion
end
