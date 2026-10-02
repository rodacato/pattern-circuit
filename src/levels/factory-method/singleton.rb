class DrinkFactory
  # Una sola fábrica para todas las sucursales.
  def self.instance = @instance ||= new

  # region: DrinkFactory#create
  def create
    Latte.new # la instancia única no sabe de qué sucursal viene el pedido
  end
  # endregion
end

class OrderFlow
  def initialize(barista) = @barista = barista
  def take(order) = @barista.prepare(DrinkFactory.instance.create)
end
