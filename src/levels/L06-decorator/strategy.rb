# region: Latte
class Latte
  def initialize(extra = NoExtra.new) = @extra = extra
  def cost = 45 + @extra.cost
end
# endregion

# Strategy elige UNA forma de calcular: aquí solo cabe un extra por bebida.
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
    pricing = { avena: OatMilkPricing, shot: ShotPricing, canela: CinnamonPricing }.fetch(request.extras.first)
    Latte.new(pricing.new) # el segundo y tercer extra se pierden
  end
  # endregion
end
