class FrontDesk {
  // region: FrontDesk#make_latte
  makeLatte() {
    const ground = new Grinder().grind('arabica')
    const machine = new EspressoMachine()
    machine.preheat() // ← cambio 1
    const shot = machine.extract(ground)
    const milk = new MilkFrother().froth('entera')
    new Counter().handOver([shot, milk])
  }
  // endregion
}

class DeliveryApp {
  // region: DeliveryApp#make_latte
  makeLatte() {
    const ground = new Grinder().grind('arabica')
    const machine = new EspressoMachine()
    machine.preheat() // ← cambio 2: la misma edición, en otro lugar
    const shot = machine.extract(ground)
    new Counter().handOver([shot])
  }
  // endregion
}
