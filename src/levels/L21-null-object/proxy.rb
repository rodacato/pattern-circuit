
# Un sustituto de la tarjeta que carga la real al usarla… y la real no existe.
# region: LazyCard
class LazyCard
  def method_missing(name, *args) = LoyaltyCards.new.find(@customer).public_send(name, *args)
end
# endregion
