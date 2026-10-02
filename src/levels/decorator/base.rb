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
    # region: Menu#drink_for:else
    else raise "No existe la clase LatteConAvenaShotYCanela" # 3 extras = 8 clases; 4 extras = 16…
    # endregion
    end
  end
  # endregion
end
