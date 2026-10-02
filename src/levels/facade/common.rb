# --- el subsistema de la cocina: piezas finas que hay que usar en orden ---
class Grinder
  # region: Grinder#grind
  def grind(beans) = :molido
  # endregion
end

class EspressoMachine
  # region: EspressoMachine#extract
  def extract(ground) = :espresso
  # endregion

  # region: EspressoMachine#preheat
  def preheat = :caliente
  # endregion
end

class MilkFrother
  # region: MilkFrother#froth
  def froth(milk) = :espuma
  # endregion
end

class Counter
  # region: Counter#hand_over
  def hand_over(drink) = puts("¡Latte listo!")
  # endregion
end
