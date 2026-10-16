
# Translating the card to another system's format doesn't help when there is no card to translate.
# region: CardAdapter
class CardAdapter:
    def __init__(self, card):
        self.card = card

    def add_points(self, amount):
        self.card.credit_points(amount)
# endregion
