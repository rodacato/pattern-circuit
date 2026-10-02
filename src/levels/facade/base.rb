class FrontDesk
  # The front desk orchestrates the kitchen step by step.
  # region: FrontDesk#make_latte
  def make_latte
    ground = Grinder.new.grind(:arabica)
    shot = EspressoMachine.new.extract(ground)
    milk = MilkFrother.new.froth(:whole)
    Counter.new.hand_over([shot, milk])
  end
  # endregion
end

class DeliveryApp
  # The app copied the orchestration… and forgot to froth the milk.
  # region: DeliveryApp#make_latte
  def make_latte
    ground = Grinder.new.grind(:arabica)
    shot = EspressoMachine.new.extract(ground)
    Counter.new.hand_over([shot])
  end
  # endregion
end
