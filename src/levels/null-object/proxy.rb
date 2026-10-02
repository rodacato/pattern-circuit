
# A stand-in for the card that loads the real one on use… and the real one doesn't exist.
# region: LazyCard
class LazyCard
  def method_missing(name, *args) = LoyaltyCards.new.find(@customer).public_send(name, *args)
end
# endregion
