// --- the rest of the coffee shop ---
class Bar {
  // region: Bar#order
  order(kind: 'coffee' | 'tea') { new { coffee: CoffeeRecipe, tea: TeaRecipe }[kind]().make() }
  // endregion
}

class Pickup {
  // region: Pickup#hand_over
  handOver(cup: Cup) { console.log('Ready!') }
  // endregion
}
