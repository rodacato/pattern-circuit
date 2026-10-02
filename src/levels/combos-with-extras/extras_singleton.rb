
class CoffeeMenu
  def self.instance = @instance ||= new

  # Un único menú compartido… que sigue eligiendo una sola subclase.
  # region: CoffeeMenu#drink_for
  def drink_for(extras) = extras.include?(:avena) ? LatteConAvena.new : LatteConShot.new
  # endregion
end
