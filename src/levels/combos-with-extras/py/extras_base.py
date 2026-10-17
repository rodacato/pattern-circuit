

class CoffeeMenu:
    # One subclass per combination of extras: the combo's coffee only supports one.
    # region: CoffeeMenu#drink_for
    def drink_for(self, extras):
        # region: CoffeeMenu#drink_for:oat
        if "oat" in extras:
            return OatMilkLatte()
        # endregion
        # region: CoffeeMenu#drink_for:shot
        elif "shot" in extras:
            return ShotLatte()
        # endregion
        # region: CoffeeMenu#drink_for:else
        else:
            raise Exception("Which subclass is it?")
        # endregion
    # endregion
