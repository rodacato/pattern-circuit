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

# region: CaramelLatte
class CaramelLatte < Latte
  def cost = super + 7
  def description = "Latte with caramel"
end
# endregion

class Menu
  # region: Menu#drink_for
  def drink_for(request)
    # region: Menu#drink_for:combo:oat
    case request.extras
    when [:oat] then OatMilkLatte.new
    # endregion
    # region: Menu#drink_for:combo:shot
    when [:shot] then ShotLatte.new
    # endregion
    # region: Menu#drink_for:combo:oat-shot
    when [:oat, :shot] then OatShotLatte.new
    # endregion
    # region: Menu#drink_for:combo:caramel
    when [:caramel] then CaramelLatte.new # ← and all its combinations are missing
    # endregion
    # region: Menu#drink_for:else
    else raise "There is no OatShotCinnamonLatte class" # 3 extras = 8 classes; 4 extras = 16…
    # endregion
    end
  end
  # endregion
end
