class FrontDesk
  # El mostrador orquesta la cocina paso a paso.
  # region: FrontDesk#make_latte
  def make_latte
    ground = Grinder.new.grind(:arabica)
    shot = EspressoMachine.new.extract(ground)
    milk = MilkFrother.new.froth(:entera)
    Counter.new.hand_over([shot, milk])
  end
  # endregion
end

class DeliveryApp
  # La app copió la orquestación… y se le olvidó espumar la leche.
  # region: DeliveryApp#make_latte
  def make_latte
    ground = Grinder.new.grind(:arabica)
    shot = EspressoMachine.new.extract(ground)
    Counter.new.hand_over([shot])
  end
  # endregion
end
