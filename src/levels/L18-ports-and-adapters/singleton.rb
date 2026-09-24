
# Una conexión global única: cómoda, y justo lo que impide cambiarla en las pruebas.
# region: Database.instance
class Database
  def self.instance = @instance ||= PG.connect(ENV.fetch("DATABASE_URL"))
end
# endregion
