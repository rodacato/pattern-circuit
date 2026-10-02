// Una puerta simple a la cocina. Los clientes ya no conocen las máquinas.
class KitchenFacade {
  // region: KitchenFacade#latte
  latte() {
    const ground = new Grinder().grind('arabica')
    const machine = new EspressoMachine()
    machine.preheat() // ← un solo lugar que cambiar
    const shot = machine.extract(ground)
    const milk = new MilkFrother().froth('entera')
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
