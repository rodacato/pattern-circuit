# --- the kitchen subsystem: fine-grained parts that must be used in order ---
class Grinder:
    # region: Grinder#grind
    def grind(self, beans):
        return "ground"
    # endregion


class EspressoMachine:
    # region: EspressoMachine#extract
    def extract(self, ground):
        return "espresso"
    # endregion

    # region: EspressoMachine#preheat
    def preheat(self):
        return "hot"
    # endregion


class MilkFrother:
    # region: MilkFrother#froth
    def froth(self, milk):
        return "foam"
    # endregion


class Counter:
    # region: Counter#hand_over
    def hand_over(self, drink):
        print("Latte ready!")
    # endregion
