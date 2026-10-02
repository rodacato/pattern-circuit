class Product
  # region: Product#make
  def make = self
  # endregion
end

# region: Combo
class Combo
  def initialize(*items) = @items = items
end
# endregion

class Combo
  # region: Combo#items
  attr_reader :items
  # endregion
end

class Kitchen
  # The kitchen asks what each thing is… and can only go down one level.
  # region: Kitchen#prepare
  def prepare(item)
    # region: Kitchen#prepare:product
    case item
    when Product then @tray.collect([item.make])
    # endregion
    # region: Kitchen#prepare:combo
    when Combo
      item.items.each do |child|
        raise "A combo inside a combo?" if child.is_a?(Combo)
        @tray.collect([child.make])
      end
    # endregion
    end
  end
  # endregion
end
