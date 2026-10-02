require "delegate"
# region: WithOatMilk
class WithOatMilk < SimpleDelegator
  def make = super.tap { |parts| parts.last.extras << :oat }
end
# endregion

# region: WithShot
class WithShot < SimpleDelegator
  def make = super.tap { |parts| parts.last.extras << :shot }
end
# endregion

class CoffeeMenu
  EXTRAS = { oat: WithOatMilk, shot: WithShot }

  # The combo's coffee is wrapped with each extra: it is still just another Product inside the combo.
  # region: CoffeeMenu#drink_for
  def drink_for(extras) = extras.reduce(Latte.new) { |drink, e| EXTRAS.fetch(e).new(drink) }
  # endregion
end
