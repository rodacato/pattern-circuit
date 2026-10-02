class Latte
  def cost = 45
  def description = "Latte"
end

# Una subclase por cada combinación de extras.
# region: LatteConAvena
class LatteConAvena < Latte
  def cost = super + 8
  def description = "Latte con avena"
end
# endregion

# region: LatteConShot
class LatteConShot < Latte
  def cost = super + 10
  def description = "Latte con shot"
end
# endregion

# region: LatteConAvenaYShot
class LatteConAvenaYShot < Latte
  def cost = super + 18
  def description = "Latte con avena y shot"
end
# endregion
