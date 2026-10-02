require "delegate"
# Envolver nil no lo convierte en una tarjeta: el envoltorio delega… a nil.
# region: CardLogger
class CardLogger < SimpleDelegator; end
# endregion
