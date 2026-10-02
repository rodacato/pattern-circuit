# Factory Method: cada preset es una subclase que decide qué pedido crear.
class PresetOrders
  # region: OrderPresets#create
  def create_order = raise(NotImplementedError)
  # endregion
end

class LatteGrandePreset < PresetOrders
  def create_order = Order.new(:grande, :entera, 1, nil, :caliente, false, nil, nil, nil)
end

class AmericanoPreset < PresetOrders
  def create_order = Order.new(:mediano, nil, 2, nil, :caliente, false, nil, nil, nil)
end

# ¿Latte grande con avena, vainilla y dos shots? No hay subclase para eso.
# 4 tamaños × 5 leches × 6 jarabes × 2 temperaturas = 240 subclases.
PRESETS = { "combo:latte-grande" => LatteGrandePreset, "combo:americano" => AmericanoPreset }

class OrderTaker
  def initialize(cashier) = @cashier = cashier

  # region: OrderTaker#take
  def take(request)
    preset = PRESETS[request.combo] or return # sin molde: el pedido se pierde
    @cashier.charge(preset.new.create_order)
  end
  # endregion
end
