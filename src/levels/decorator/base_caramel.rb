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

# region: CaramelLatte
class CaramelLatte < Latte
  def cost = super + 7
  def description = "Latte con caramelo"
end
# endregion

class Menu
  # region: Menu#drink_for
  def drink_for(request)
    # region: Menu#drink_for:combo:avena
    case request.extras
    when [:avena] then OatMilkLatte.new
    # endregion
    # region: Menu#drink_for:combo:shot
    when [:shot] then ShotLatte.new
    # endregion
    # region: Menu#drink_for:combo:avena-shot
    when [:avena, :shot] then OatShotLatte.new
    # endregion
    # region: Menu#drink_for:combo:caramelo
    when [:caramelo] then CaramelLatte.new # ← y faltan todas sus combinaciones
    # endregion
    # region: Menu#drink_for:else
    else raise "No existe la clase LatteConAvenaShotYCanela" # 3 extras = 8 clases; 4 extras = 16…
    # endregion
    end
  end
  # endregion
end
