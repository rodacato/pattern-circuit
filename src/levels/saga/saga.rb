# Each step has its compensating action. If one fails, the previous ones are undone in reverse order.
class PlaceOrderSaga
  STEPS = [
    [->(o) { Payments.charge(o) },  ->(o) { Payments.refund(o) }],
    [->(o) { Inventory.reserve(o) }, ->(o) { Inventory.release(o) }],
  ]

  # region: PlaceOrderSaga#call
  def call(order)
    done = []
    STEPS.each do |step, compensation|
      step.call(order)
      done << compensation
    end
    Barista.new.prepare(order)
  rescue OutOfStock
    done.reverse_each { |compensation| compensation.call(order) }
    Counter.new.notify(order, "No supplies left: we refunded your money")
  end
  # endregion
end

# region: Payments.charge
module Payments
  def self.charge(order) = Gateway.charge(order.total)
  def self.refund(order) = Gateway.refund(order.total)
end
# endregion

# region: Payments.refund
# The compensation for the charge: it does not erase the past, it corrects it with a refund.
# endregion

# region: Inventory.reserve
module Inventory
  def self.reserve(order) = (raise OutOfStock unless Stock.available?(order.items))
  def self.release(order) = Stock.release(order.items)
end
# endregion
