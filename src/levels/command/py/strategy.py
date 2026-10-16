

# A cancellation strategy is useless if the action already ran.
# region: CancelStrategy
class CancelStrategy:
    def call(self, request):
        raise RuntimeError("There is nothing to apply the strategy to: the order already ran")
# endregion
