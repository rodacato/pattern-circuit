# region: Latte
class Latte
  def initialize(extra = NoExtra.new) = @extra = extra
  def cost = 45 + @extra.cost
  def description = "Latte"
end
# endregion

# Strategy picks ONE way to calculate: only one extra fits per drink here.
# region: OatMilkPricing
class OatMilkPricing
  def cost = 8
end
# endregion

# region: ShotPricing
class ShotPricing
  def cost = 10
end
# endregion

# region: CinnamonPricing
class CinnamonPricing
  def cost = 5
end
# endregion

class Menu
  # region: Menu#drink_for
  def drink_for(request)
    pricing = { oat: OatMilkPricing, shot: ShotPricing, cinnamon: CinnamonPricing }.fetch(request.extras.first)
    Latte.new(pricing.new) # the second and third extras are lost
  end
  # endregion
end
