class FrontDesk {
  // region: FrontDesk#make_latte
  makeLatte() {
    const ground = new Grinder().grind('arabica')
    const machine = new EspressoMachine()
    machine.preheat() // ← change 1
    const shot = machine.extract(ground)
    const milk = new MilkFrother().froth('whole')
    new Counter().handOver([shot, milk])
  }
  // endregion
}

class DeliveryApp {
  // region: DeliveryApp#make_latte
  makeLatte() {
    const ground = new Grinder().grind('arabica')
    const machine = new EspressoMachine()
    machine.preheat() // ← change 2: the same edit, somewhere else
    const shot = machine.extract(ground)
    new Counter().handOver([shot])
  }
  // endregion
}
