
# Wrapping None doesn't turn it into a card: the wrapper delegates… to None.
# region: CardLogger
class CardLogger:
    def __init__(self, inner):
        self.inner = inner

    def add_points(self, amount):
        self.inner.add_points(amount)

    @property
    def discount(self):
        return self.inner.discount

    @property
    def masked_number(self):
        return self.inner.masked_number
# endregion
