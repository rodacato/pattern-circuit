
class CoffeeMenu
  # region: CoffeeMenu#drink_for
  def drink_for(extras) = LegacyPos.new.lookup(extras.join("+")) # the old system does not know the combination either
  # endregion
end
