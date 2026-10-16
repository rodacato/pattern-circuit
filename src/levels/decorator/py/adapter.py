class Menu:
    # region: Menu#drink_for
    def drink_for(self, request):
        return LegacyMenuAdapter(OldPos()).drink_for(request)
    # endregion


# Translates the request to the old POS format… which doesn't know combinations either.
# region: LegacyMenuAdapter
class LegacyMenuAdapter:
    def __init__(self, pos):
        self.pos = pos

    def drink_for(self, request):
        return self.pos.lookup("+".join(request.extras))
# endregion
