# A single instance of the remote client… that still travels to the warehouse on every query.
# region: RemoteInventory.instance
def instance(cls):
    if cls._shared is None:
        cls._shared = cls()
    return cls._shared


RemoteInventory._shared = None
RemoteInventory.instance = classmethod(instance)
# endregion


# region: wiring
taker = OrderTaker(RemoteInventory.instance(), barista)
# endregion
