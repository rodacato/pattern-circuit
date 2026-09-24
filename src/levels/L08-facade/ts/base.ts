class FrontDesk {
  // El mostrador orquesta la cocina paso a paso.
  // region: FrontDesk#make_latte
  makeLatte() {
    const ground = new Grinder().grind('arabica')
    const shot = new EspressoMachine().extract(ground)
    const milk = new MilkFrother().froth('entera')
    new Counter().handOver([shot, milk])
  }
  // endregion
}

class DeliveryApp {
  // La app copió la orquestación… y se le olvidó espumar la leche.
  // region: DeliveryApp#make_latte
  makeLatte() {
    const ground = new Grinder().grind('arabica')
    const shot = new EspressoMachine().extract(ground)
    new Counter().handOver([shot])
  }
  // endregion
}
