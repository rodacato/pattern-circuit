class Latte
  def cost = 45
  def description = "Latte"
end

# One subclass for each combination of extras.
# region: OatMilkLatte
class OatMilkLatte < Latte
  def cost = super + 8
  def description = "Latte with oat"
end
# endregion

# region: ShotLatte
class ShotLatte < Latte
  def cost = super + 10
  def description = "Latte with shot"
end
# endregion

# region: OatShotLatte
class OatShotLatte < Latte
  def cost = super + 18
  def description = "Latte with oat and shot"
end
# endregion
