

class CoffeeMenu:
    # region: CoffeeMenu#drink_for
    def drink_for(self, extras):
        return LegacyPos().lookup("+".join(extras))  # the old system does not know the combination either
    # endregion
