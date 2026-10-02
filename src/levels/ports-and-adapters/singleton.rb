
# A single global connection: convenient, and exactly what prevents swapping it in tests.
# region: Database.instance
class Database
  def self.instance = @instance ||= PG.connect(ENV.fetch("DATABASE_URL"))
end
# endregion
