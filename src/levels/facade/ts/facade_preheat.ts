// A simple door to the kitchen. Clients no longer know the machines.
class KitchenFacade {
  // region: KitchenFacade#latte
  latte() {
    const ground = new Grinder().grind('arabica')
    const machine = new EspressoMachine()
    machine.preheat() // ← only one place to change
    const shot = machine.extract(ground)
    const milk = new MilkFrother().froth('whole')
    new Counter().handOver([shot, milk])
  }
  // endregion
}

class FrontDesk {
  // region: FrontDesk#make_latte
  makeLatte() { new KitchenFacade().latte() }
  // endregion
}

class DeliveryApp {
  // region: DeliveryApp#make_latte
  makeLatte() { new KitchenFacade().latte() }
  // endregion
}
