require "delegate"

# region: Latte
class Latte
  def cost = 45
  def description = "Latte"
end
# endregion

# Cada extra envuelve a la bebida y suma lo suyo. Se combinan solos.
# region: WithOatMilk
class WithOatMilk < SimpleDelegator
  def cost = super + 8
  def description = "#{super} con avena"
end
# endregion

# region: WithShot
class WithShot < SimpleDelegator
  def cost = super + 10
  def description = "#{super} con shot"
end
# endregion

# region: WithCinnamon
class WithCinnamon < SimpleDelegator
  def cost = super + 5
  def description = "#{super} con canela"
end
# endregion

# region: WithCaramel
class WithCaramel < SimpleDelegator # ← un extra nuevo: una clase, nada más
  def cost = super + 7
  def description = "#{super} con caramelo"
end
# endregion

class Menu
  EXTRAS = { avena: WithOatMilk, shot: WithShot, canela: WithCinnamon, caramelo: WithCaramel }

  # region: Menu#drink_for
  def drink_for(request)
    request.extras.reduce(Latte.new) { |drink, extra| EXTRAS.fetch(extra).new(drink) }
  end
  # endregion
end
