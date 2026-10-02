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
    # region: Menu#drink_for:else
    else raise "There is no OatShotCinnamonLatte class" # 3 extras = 8 classes; 4 extras = 16…
    # endregion
    end
  end
  # endregion
end
