require "delegate"
# Wrapping nil doesn't turn it into a card: the wrapper delegates… to nil.
# region: CardLogger
class CardLogger < SimpleDelegator; end
# endregion
