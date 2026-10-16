class FrontDesk:
    def __init__(self, barista):
        self.barista = barista

    # Each order runs on the spot: there is nothing left to undo.
    # region: FrontDesk#submit
    def submit(self, request):
        match request.action:
            # region: FrontDesk#submit:cmd:order
            case "order":
                self.barista.prepare(request.drink)
            # endregion
            # region: FrontDesk#submit:cmd:cancel
            case "cancel":
                Undo().call(request)
            # endregion
    # endregion


# region: Undo#call
class Undo:
    def call(self, request):
        raise RuntimeError("Undo what? The coffee is already being made")
# endregion
