class FrontDesk:
    # region: FrontDesk#make_latte
    def make_latte(self):
        ground = Grinder().grind("arabica")
        machine = EspressoMachine()
        machine.preheat()  # ← change 1
        shot = machine.extract(ground)
        milk = MilkFrother().froth("whole")
        Counter().hand_over([shot, milk])
    # endregion


class DeliveryApp:
    # region: DeliveryApp#make_latte
    def make_latte(self):
        ground = Grinder().grind("arabica")
        machine = EspressoMachine()
        machine.preheat()  # ← change 2: the same edit, somewhere else
        shot = machine.extract(ground)
        Counter().hand_over([shot])
    # endregion
