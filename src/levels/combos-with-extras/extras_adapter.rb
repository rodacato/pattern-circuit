
class CoffeeMenu
  # region: CoffeeMenu#drink_for
  def drink_for(extras) = LegacyPos.new.lookup(extras.join("+")) # el sistema viejo tampoco conoce la combinación
  # endregion
end
