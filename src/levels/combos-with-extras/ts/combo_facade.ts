
// A single desk to order combos… that inside still cannot unpack a nested combo.
// region: ComboDesk
class ComboDesk {
  prepare(combo: Combo) { return new Kitchen().prepare(combo) }
}
// endregion
