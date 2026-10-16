

class CoffeeMenu:
    shared = None

    @classmethod
    def instance(cls):
        if cls.shared is None:
            cls.shared = cls()
        return cls.shared

    # A single shared menu… that still picks only one subclass.
    # region: CoffeeMenu#drink_for
    def drink_for(self, extras):
        return OatMilkLatte() if "oat" in extras else ShotLatte()
    # endregion
