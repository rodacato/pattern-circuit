# A simple door to the kitchen. Clients no longer know the machines.
class KitchenFacade:
    # region: KitchenFacade#latte
    def latte(self):
        ground = Grinder().grind("arabica")
        machine = EspressoMachine()
        shot = machine.extract(ground)
        milk = MilkFrother().froth("whole")
        Counter().hand_over([shot, milk])
    # endregion


class FrontDesk:
    # region: FrontDesk#make_latte
    def make_latte(self):
        KitchenFacade().latte()
    # endregion


class DeliveryApp:
    # region: DeliveryApp#make_latte
    def make_latte(self):
        KitchenFacade().latte()
    # endregion
