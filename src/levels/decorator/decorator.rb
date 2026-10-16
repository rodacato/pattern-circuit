require "delegate"

# region: Latte
class Latte
  def cost = 45
  def description = "Latte"
end
# endregion

# Each extra wraps the drink and adds its own cost. They combine on their own.
# region: WithOatMilk
class WithOatMilk < SimpleDelegator
  def cost = super + 8
  def description = "#{super} with oat"
end
# endregion

# region: WithShot
class WithShot < SimpleDelegator
  def cost = super + 10
  def description = "#{super} with shot"
end
# endregion

# region: WithCinnamon
class WithCinnamon < SimpleDelegator
  def cost = super + 5
  def description = "#{super} with cinnamon"
end
# endregion

class Menu
  EXTRAS = { oat: WithOatMilk, shot: WithShot, cinnamon: WithCinnamon }

  # region: Menu#drink_for
  def drink_for(request)
    request.extras.reduce(Latte.new) { |drink, extra| EXTRAS.fetch(extra).new(drink) }
  end
  # endregion
end
