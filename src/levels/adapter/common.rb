# --- the rest of the coffee shop ---
class OrderTaker
  def initialize(cashier) = @cashier = cashier

  # region: OrderTaker#take
  def take(order) = @cashier.charge(order)
  # endregion
end

# External vendor SDK: we cannot modify it.
module PagoFacil
  class SDK
    # region: PagoFacil::SDK#charge_in_cents
    def charge_in_cents(amount_cents:, reference:) = { status: "ok" }
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
  def hand_over(order) = puts("#{order.drink} ready!")
  # endregion
end
