
class CoffeeMenu
  # Una subclase por combinación de extras: el café del combo solo admite una.
  # region: CoffeeMenu#drink_for
  def drink_for(extras)
    # region: CoffeeMenu#drink_for:avena
    if extras.include?(:avena) then OatMilkLatte.new
    # endregion
    # region: CoffeeMenu#drink_for:shot
    elsif extras.include?(:shot) then ShotLatte.new
    # endregion
    # region: CoffeeMenu#drink_for:else
    else raise "¿Qué subclase le toca?"
    # endregion
    end
  end
  # endregion
end

# region: OatMilkLatte
class OatMilkLatte < Product; end
# endregion

# region: ShotLatte
class ShotLatte < Product; end
# endregion
