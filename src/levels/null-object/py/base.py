class LoyaltyCards:
    def __init__(self):
        self.cards = {}

    # If the customer has no card, it returns None… and every later use blows up:
    # AttributeError: 'NoneType' object has no attribute 'add_points'
    # region: LoyaltyCards#find
    def find(self, customer):
        return self.cards.get(customer.id)
    # endregion
