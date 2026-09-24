# Cada eslabón atiende lo suyo o lo pasa al siguiente. Nadie conoce la cadena completa.
class Handler
  def initialize(next_handler = nil) = @next = next_handler

  def handle(request)
    can_handle?(request) ? @refunds.pay(request) : pass(request)
  end

  def pass(request) = @next ? @next.handle(request) : @refunds.decline(request)
end

# region: Cashier#handle
class Cashier < Handler
  def can_handle?(r) = r.amount < 100
end
# endregion

# region: Manager#handle
class Manager < Handler
  def can_handle?(r) = r.amount < 500
end
# endregion

# region: Owner#handle
class Owner < Handler
  def can_handle?(r) = r.amount < 2000
end
# endregion

# region: wiring
chain = Cashier.new(Manager.new(Owner.new))
# endregion
