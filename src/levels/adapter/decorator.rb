require "delegate"

class Cashier
  def initialize(gateway, barista)
    @gateway = LoggedGateway.new(gateway)
    @barista = barista
  end

  # region: Cashier#charge
  def charge(order)
    @gateway.charge(order.total) # sigue sin existir #charge en el SDK envuelto
    @barista.prepare(order)
  end
  # endregion
end

# Envuelve y añade logs… pero delega la misma llamada que el SDK no entiende.
# region: LoggedGateway
class LoggedGateway < SimpleDelegator
  def charge(total)
    puts "cobrando #{total}"
    __getobj__.charge(total)
  end
end
# endregion
