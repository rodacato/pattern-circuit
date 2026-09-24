
# Una ventanilla única para pedir combos… que por dentro sigue sin saber desarmar un combo anidado.
# region: ComboDesk
class ComboDesk
  def prepare(combo) = Kitchen.new.prepare(combo)
end
# endregion
