
# A single desk to order combos… that inside still cannot unpack a nested combo.
# region: ComboDesk
class ComboDesk
  def prepare(combo) = Kitchen.new.prepare(combo)
end
# endregion
