
# An intermediary that controls access to the machine… without fixing what the app skips.
# region: EspressoMachineProxy
class EspressoMachineProxy:
    def __init__(self, machine):
        self.machine = machine

    def extract(self, ground):
        return self.machine.extract(ground)
# endregion
