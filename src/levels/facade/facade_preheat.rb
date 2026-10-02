# Una puerta simple a la cocina. Los clientes ya no conocen las máquinas.
class KitchenFacade
  # region: KitchenFacade#latte
  def latte
    ground = Grinder.new.grind(:arabica)
    machine = EspressoMachine.new
    machine.preheat # ← un solo lugar que cambiar
    shot = machine.extract(ground)
    milk = MilkFrother.new.froth(:entera)
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
