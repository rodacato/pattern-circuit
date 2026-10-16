
# A single shared instance of the store… with the same old queue.
# region: OrderStore.instance
class SharedOrderStore:
    _instance = None

    @classmethod
    def instance(cls):
        if cls._instance is None:
            cls._instance = OrderStore()
        return cls._instance
# endregion
