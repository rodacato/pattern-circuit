class FrontDesk:
    # The front desk orchestrates the kitchen step by step.
    # region: FrontDesk#make_latte
    def make_latte(self):
        ground = Grinder().grind("arabica")
        shot = EspressoMachine().extract(ground)
        milk = MilkFrother().froth("whole")
        Counter().hand_over([shot, milk])
    # endregion


class DeliveryApp:
    # The app copied the orchestration… and forgot to froth the milk.
    # region: DeliveryApp#make_latte
    def make_latte(self):
        ground = Grinder().grind("arabica")
        shot = EspressoMachine().extract(ground)
        Counter().hand_over([shot])
    # endregion
