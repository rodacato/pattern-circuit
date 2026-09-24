class OrderPresets
  # Un molde por combinación: 4 tamaños × 5 leches × 6 jarabes × 2 temperaturas = 240 moldes.
  # region: OrderPresets#create
  def create(combo)
    case combo
    when :latte_grande then Order.new(:grande, :entera, 1, nil, :caliente, false, nil, nil, nil)
    when :americano then Order.new(:mediano, nil, 2, nil, :caliente, false, nil, nil, nil)
    # ¿latte grande con avena, vainilla y dos shots? no hay molde: el pedido se pierde
    end
  end
  # endregion
end

class OrderTaker
  def initialize(cashier) = @cashier = cashier

  # region: OrderTaker#take
  def take(request)
    order = OrderPresets.new.create(request.combo) or return
    @cashier.charge(order)
  end
  # endregion
end
