
# A cancellation strategy is useless if the action already ran.
# region: CancelStrategy
class CancelStrategy
  def call(request) = raise("There is nothing to apply the strategy to: the order already ran")
end
# endregion
