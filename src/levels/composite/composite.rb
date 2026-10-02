# Hoja y grupo responden al mismo mensaje: `make`.
class Product
  # region: Product#make
  def make = [self]
  # endregion
end

class Combo
  def initialize(*items) = @items = items

  # Un combo prepara lo suyo pidiéndole `make` a cada parte, sea producto o combo.
  # region: Combo#make
  def make = @items.flat_map(&:make)
  # endregion
end

class Kitchen
  # Ni un if: la cocina ya no pregunta qué es cada cosa.
  # region: Kitchen#prepare
  def prepare(item) = @tray.collect(item.make)
  # endregion
end
