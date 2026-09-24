
class CoffeeMenu
  # Una subclase por combinación de extras: el café del combo solo admite una.
  # region: CoffeeMenu#drink_for
  def drink_for(extras)
    # region: CoffeeMenu#drink_for:avena
    if extras.include?(:avena) then LatteConAvena.new
    # endregion
    # region: CoffeeMenu#drink_for:shot
    elsif extras.include?(:shot) then LatteConShot.new
    # endregion
    # region: CoffeeMenu#drink_for:else
    else raise "¿Qué subclase le toca?"
    # endregion
    end
  end
  # endregion
end

# region: LatteConAvena
class LatteConAvena < Product; end
# endregion

# region: LatteConShot
class LatteConShot < Product; end
# endregion
