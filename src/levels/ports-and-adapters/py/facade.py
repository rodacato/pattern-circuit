
# An infrastructure facade hides the details, but the core still calls the real DB.
# region: Infrastructure
class Infrastructure:
    def save_and_charge(self, order):
        PG.connect(os.environ["DATABASE_URL"])
        return Stripe.Charge.create(amount=order.total_cents)
# endregion
