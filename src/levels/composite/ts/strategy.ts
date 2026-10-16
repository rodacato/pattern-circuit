
// One strategy per item type… and none knows what to do with a nested combo.
// region: ComboStrategy
class ComboStrategy {
  prepare(combo: Combo) { throw new Error('nested combo') }
}
// endregion
