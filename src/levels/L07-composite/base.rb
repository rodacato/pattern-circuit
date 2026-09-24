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
  # La cocina pregunta qué es cada cosa… y solo sabe bajar un nivel.
  # region: Kitchen#prepare
  def prepare(item)
    # region: Kitchen#prepare:producto
    case item
    when Product then @tray.collect([item.make])
    # endregion
    # region: Kitchen#prepare:combo
    when Combo
      item.items.each do |child|
        raise "¿Un combo dentro de un combo?" if child.is_a?(Combo)
        @tray.collect([child.make])
      end
    # endregion
    end
  end
  # endregion
end
