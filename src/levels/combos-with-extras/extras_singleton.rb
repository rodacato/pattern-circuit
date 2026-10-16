
class CoffeeMenu
  def self.instance = @instance ||= new

  # A single shared menu… that still picks only one subclass.
  # region: CoffeeMenu#drink_for
  def drink_for(extras) = extras.include?(:oat) ? OatMilkLatte.new : ShotLatte.new
  # endregion
end
