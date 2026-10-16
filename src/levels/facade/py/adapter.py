
# Translates the app's request to the counter's format… but the incomplete orchestration is still there.
# region: DeliveryRequestAdapter
class DeliveryRequestAdapter:
    def __init__(self, app):
        self.app = app

    def make_latte(self):
        self.app.make_latte()
# endregion
