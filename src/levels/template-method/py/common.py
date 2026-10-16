# --- the rest of the coffee shop ---
class Bar:
    # region: Bar#order
    def order(self, kind):
        {"coffee": CoffeeRecipe, "tea": TeaRecipe}[kind]().make()
    # endregion


class Pickup:
    # region: Pickup#hand_over
    def hand_over(self, cup):
        print("Ready!")
    # endregion
