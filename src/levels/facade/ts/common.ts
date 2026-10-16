// --- the kitchen subsystem: fine-grained parts that must be used in order ---
class Grinder {
  // region: Grinder#grind
  grind(beans: string) { return 'ground' }
  // endregion
}

class EspressoMachine {
  // region: EspressoMachine#extract
  extract(ground: string) { return 'espresso' }
  // endregion

  // region: EspressoMachine#preheat
  preheat() { return 'hot' }
  // endregion
}

class MilkFrother {
  // region: MilkFrother#froth
  froth(milk: string) { return 'foam' }
  // endregion
}

class Counter {
  // region: Counter#hand_over
  handOver(drink: string[]) { console.log('Latte ready!') }
  // endregion
}
