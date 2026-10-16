
# An adapter for Stripe helps… but the core is still tied to Postgres.
# region: StripeAdapter
class StripeAdapter:
    def charge(self, order):
        return Stripe.Charge.create(amount=order.total_cents)
# endregion
