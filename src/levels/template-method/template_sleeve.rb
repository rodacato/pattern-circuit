# The recipe skeleton lives in one place; subclasses only fill in `brew`.
class Recipe
  # region: Recipe#make
  def make
    boil_water
    brew
    pour_in_cup
    put_lid
    add_sleeve # ← a single place
  end
  # endregion

  # region: Recipe#boil_water
  def boil_water = heat(:water, 92)
  # endregion

  # region: Recipe#pour_in_cup
  def pour_in_cup = @cup.fill
  # endregion

  # region: Recipe#put_lid
  def put_lid = @cup.lid!
  # endregion

  # region: Recipe#add_sleeve
  def add_sleeve = @cup.sleeve!
  # endregion

  def brew = raise(NotImplementedError)
end

class CoffeeRecipe < Recipe
  # region: CoffeeRecipe#brew
  def brew = extract_espresso
  # endregion
end

class TeaRecipe < Recipe
  # region: TeaRecipe#brew
  def brew = steep(3.minutes)
  # endregion
end
