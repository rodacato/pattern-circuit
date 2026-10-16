from abc import ABC, abstractmethod


# Factory Method: each preset is a subclass that decides which order to create.
class PresetOrders(ABC):
    # region: OrderPresets#create
    @abstractmethod
    def create_order(self): ...
    # endregion


class LargeLattePreset(PresetOrders):
    def create_order(self):
        return Order("large", "whole", 1, None, "hot", False, None, None, None)


class AmericanoPreset(PresetOrders):
    def create_order(self):
        return Order("medium", None, 2, None, "hot", False, None, None, None)


# Large latte with oat, vanilla and two shots? There is no subclass for that.
# 4 sizes × 5 milks × 6 syrups × 2 temperatures = 240 subclasses.
PRESETS = {"combo:large-latte": LargeLattePreset, "combo:americano": AmericanoPreset}


class OrderTaker:
    def __init__(self, cashier):
        self.cashier = cashier

    # region: OrderTaker#take
    def take(self, request):
        preset = PRESETS.get(request.combo)
        if preset is None:
            return  # no preset: the order is lost
        self.cashier.charge(preset().create_order())
    # endregion
