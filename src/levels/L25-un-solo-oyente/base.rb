# Solo la cocina necesita saber que se cobró un pedido… y nadie le avisa.
class Cashier
  # region: Cashier#charge
  def charge(order)
    CardTerminal.charge(order)
    # ¿y la cocina? El pedido se queda esperando.
  end
  # endregion
end

# region: wiring
OrderTaker.new(Cashier.new).take(:latte)
# endregion
