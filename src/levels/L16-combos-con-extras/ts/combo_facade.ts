
// Una ventanilla única para pedir combos… que por dentro sigue sin saber desarmar un combo anidado.
// region: ComboDesk
class ComboDesk {
  prepare(combo: Combo) { return new Kitchen().prepare(combo) }
}
// endregion
