# --- el resto de la cafetería ---
class OrderTaker
  def initialize(cashier) = @cashier = cashier

  # region: OrderTaker#take
  def take(order) = @cashier.charge(order)
  # endregion
end

# SDK del proveedor externo: no lo podemos modificar.
module PagoFacil
  class SDK
    # region: PagoFacil::SDK#cobrar_en_centavos
    def cobrar_en_centavos(monto_centavos:, referencia:) = { estado: "ok" }
    # endregion
  end
end

class Barista
  def initialize(counter) = @counter = counter

  # region: Barista#prepare
  def prepare(order) = @counter.hand_over(order)
  # endregion
end

class Counter
  # region: Counter#hand_over
  def hand_over(order) = puts("¡#{order.drink} listo!")
  # endregion
end
