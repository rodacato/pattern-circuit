class LoyaltyCards:
    def __init__(self):
        self.cards = {}

    # region: LoyaltyCards#find
    def find(self, customer):
        return self.cards.get(customer.id) or NullCard()
    # endregion


# Responds to everything a card responds to, doing nothing. Nobody needs to ask "is it None?".
# region: NullCard
class NullCard:
    def add_points(self, _amount):
        pass

    @property
    def discount(self):
        return 0

    @property
    def masked_number(self):
        return "no card"
# endregion
