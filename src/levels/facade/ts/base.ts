class FrontDesk {
  // The front desk orchestrates the kitchen step by step.
  // region: FrontDesk#make_latte
  makeLatte() {
    const ground = new Grinder().grind('arabica')
    const shot = new EspressoMachine().extract(ground)
    const milk = new MilkFrother().froth('whole')
    new Counter().handOver([shot, milk])
  }
  // endregion
}

class DeliveryApp {
  // The app copied the orchestration… and forgot to froth the milk.
  // region: DeliveryApp#make_latte
  makeLatte() {
    const ground = new Grinder().grind('arabica')
    const shot = new EspressoMachine().extract(ground)
    new Counter().handOver([shot])
  }
  // endregion
}
