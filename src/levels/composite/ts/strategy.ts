
// Una estrategia por tipo de ítem… y ninguna sabe qué hacer con un combo anidado.
// region: ComboStrategy
class ComboStrategy {
  prepare(combo: Combo) { throw new Error('combo anidado') }
}
// endregion
