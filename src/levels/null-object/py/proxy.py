
# A stand-in for the card that loads the real one on use… and the real one doesn't exist.
# region: LazyCard
class LazyCard:
    def __init__(self, customer):
        self.customer = customer

    @property
    def real(self):
        return LoyaltyCards().find(self.customer)

    def add_points(self, amount):
        self.real.add_points(amount)

    @property
    def discount(self):
        return self.real.discount

    @property
    def masked_number(self):
        return self.real.masked_number
# endregion
