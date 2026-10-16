

# A single desk to order combos… that inside still cannot unpack a nested combo.
# region: ComboDesk
class ComboDesk:
    def prepare(self, combo):
        return Kitchen().prepare(combo)
# endregion
