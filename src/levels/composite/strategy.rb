
# One strategy per item type… and none knows what to do with a nested combo.
# region: ComboStrategy
class ComboStrategy
  def prepare(combo) = raise(NotImplementedError, "nested combo")
end
# endregion
