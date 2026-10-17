
class CoffeeMenu
  # One subclass per combination of extras: the combo's coffee only supports one.
  # region: CoffeeMenu#drink_for
  def drink_for(extras)
    # region: CoffeeMenu#drink_for:oat
    if extras.include?(:oat) then OatMilkLatte.new
    # endregion
    # region: CoffeeMenu#drink_for:shot
    elsif extras.include?(:shot) then ShotLatte.new
    # endregion
    # region: CoffeeMenu#drink_for:else
    else raise "Which subclass is it?"
    # endregion
    end
  end
  # endregion
end
