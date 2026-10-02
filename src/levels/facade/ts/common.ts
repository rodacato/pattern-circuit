// --- el subsistema de la cocina: piezas finas que hay que usar en orden ---
class Grinder {
  // region: Grinder#grind
  grind(beans: string) { return 'molido' }
  // endregion
}

class EspressoMachine {
  // region: EspressoMachine#extract
  extract(ground: string) { return 'espresso' }
  // endregion

  // region: EspressoMachine#preheat
  preheat() { return 'caliente' }
  // endregion
}

class MilkFrother {
  // region: MilkFrother#froth
  froth(milk: string) { return 'espuma' }
  // endregion
}

class Counter {
  // region: Counter#hand_over
  handOver(drink: string[]) { console.log('¡Latte listo!') }
  // endregion
}
