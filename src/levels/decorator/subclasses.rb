class Latte
  def cost = 45
  def description = "Latte"
end

# Una subclase por cada combinación de extras.
# region: OatMilkLatte
class OatMilkLatte < Latte
  def cost = super + 8
  def description = "Latte con avena"
end
# endregion

# region: ShotLatte
class ShotLatte < Latte
  def cost = super + 10
  def description = "Latte con shot"
end
# endregion

# region: OatShotLatte
class OatShotLatte < Latte
  def cost = super + 18
  def description = "Latte con avena y shot"
end
# endregion
