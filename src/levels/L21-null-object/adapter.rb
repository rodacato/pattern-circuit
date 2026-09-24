
# Traducir la tarjeta al formato de otro sistema no ayuda cuando no hay tarjeta que traducir.
# region: CardAdapter
class CardAdapter
  def initialize(card) = @card = card
  def add_points(amount) = @card.sumar_puntos(amount)
end
# endregion
