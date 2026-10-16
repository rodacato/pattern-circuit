# Factory Method: each preset is a subclass that decides which order to create.
class PresetOrders
  # region: OrderPresets#create
  def create_order = raise(NotImplementedError)
  # endregion
end

class LargeLattePreset < PresetOrders
  def create_order = Order.new(:large, :whole, 1, nil, :hot, false, nil, nil, nil)
end

class AmericanoPreset < PresetOrders
  def create_order = Order.new(:medium, nil, 2, nil, :hot, false, nil, nil, nil)
end

# Large latte with oat, vanilla and two shots? There is no subclass for that.
# 4 sizes × 5 milks × 6 syrups × 2 temperatures = 240 subclasses.
PRESETS = { "combo:large-latte" => LargeLattePreset, "combo:americano" => AmericanoPreset }

class OrderTaker
  def initialize(cashier) = @cashier = cashier

  # region: OrderTaker#take
  def take(request)
    preset = PRESETS[request.combo] or return # no preset: the order is lost
    @cashier.charge(preset.new.create_order)
  end
  # endregion
end
