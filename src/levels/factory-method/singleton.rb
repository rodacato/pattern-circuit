class DrinkFactory
  # One single factory for all the branches.
  def self.instance = @instance ||= new

  # region: DrinkFactory#create
  def create
    Latte.new # the single instance does not know which branch the order comes from
  end
  # endregion
end

class OrderFlow
  def initialize(barista) = @barista = barista
  def take(order) = @barista.prepare(DrinkFactory.instance.create)
end
