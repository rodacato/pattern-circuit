require "delegate"

class Cashier
  def initialize(gateway, barista)
    @gateway = LoggedGateway.new(gateway)
    @barista = barista
  end

  # region: Cashier#charge
  def charge(order)
    @gateway.charge(order.total) # #charge still does not exist on the wrapped SDK
    @barista.prepare(order)
  end
  # endregion
end

# Wraps and adds logs… but delegates the same call the SDK does not understand.
# region: LoggedGateway
class LoggedGateway < SimpleDelegator
  def charge(total)
    puts "charging #{total}"
    __getobj__.charge(total)
  end
end
# endregion
