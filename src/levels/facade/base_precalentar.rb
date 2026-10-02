class FrontDesk
  # region: FrontDesk#make_latte
  def make_latte
    ground = Grinder.new.grind(:arabica)
    machine = EspressoMachine.new
    machine.preheat # ← cambio 1
    shot = machine.extract(ground)
    milk = MilkFrother.new.froth(:entera)
    Counter.new.hand_over([shot, milk])
  end
  # endregion
end

class DeliveryApp
  # region: DeliveryApp#make_latte
  def make_latte
    ground = Grinder.new.grind(:arabica)
    machine = EspressoMachine.new
    machine.preheat # ← cambio 2: la misma edición, en otro lugar
    shot = machine.extract(ground)
    Counter.new.hand_over([shot])
  end
  # endregion
end
