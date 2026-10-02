// --- el resto de la cafetería ---
class Bar {
  // region: Bar#order
  order(kind: 'cafe' | 'te') { new { cafe: CoffeeRecipe, te: TeaRecipe }[kind]().make() }
  // endregion
}

class Pickup {
  // region: Pickup#hand_over
  handOver(cup: Cup) { console.log('¡Listo!') }
  // endregion
}
