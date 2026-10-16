# --- the kitchen subsystem: fine-grained parts that must be used in order ---
class Grinder
  # region: Grinder#grind
  def grind(beans) = :ground
  # endregion
end

class EspressoMachine
  # region: EspressoMachine#extract
  def extract(ground) = :espresso
  # endregion

  # region: EspressoMachine#preheat
  def preheat = :hot
  # endregion
end

class MilkFrother
  # region: MilkFrother#froth
  def froth(milk) = :foam
  # endregion
end

class Counter
  # region: Counter#hand_over
  def hand_over(drink) = puts("Latte ready!")
  # endregion
end
