
# A single global connection: convenient, and exactly what prevents swapping it in tests.
# region: Database.instance
class Database:
    _instance = None

    @classmethod
    def instance(cls):
        if cls._instance is None:
            cls._instance = PG.connect(os.environ["DATABASE_URL"])
        return cls._instance
# endregion
