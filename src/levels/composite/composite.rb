# Leaf and group answer the same message: `make`.
class Product
  # region: Product#make
  def make = [self]
  # endregion
end

class Combo
  def initialize(*items) = @items = items

  # A combo makes its own by asking each part for `make`, whether product or combo.
  # region: Combo#make
  def make = @items.flat_map(&:make)
  # endregion
end

class Kitchen
  # Not a single if: the kitchen no longer asks what each thing is.
  # region: Kitchen#prepare
  def prepare(item) = @tray.collect(item.make)
  # endregion
end
