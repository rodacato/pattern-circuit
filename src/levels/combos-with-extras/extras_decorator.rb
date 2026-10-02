require "delegate"
# region: WithOatMilk
class WithOatMilk < SimpleDelegator
  def make = super.tap { |parts| parts.last.extras << :avena }
end
# endregion

# region: WithShot
class WithShot < SimpleDelegator
  def make = super.tap { |parts| parts.last.extras << :shot }
end
# endregion

class CoffeeMenu
  EXTRAS = { avena: WithOatMilk, shot: WithShot }

  # El café del combo se envuelve con cada extra: sigue siendo un Product más dentro del combo.
  # region: CoffeeMenu#drink_for
  def drink_for(extras) = extras.reduce(Latte.new) { |drink, e| EXTRAS.fetch(e).new(drink) }
  # endregion
end
