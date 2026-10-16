
# An intermediary that controls access to the machine… without fixing what the app skips.
# region: EspressoMachineProxy
class EspressoMachineProxy
  def initialize(machine) = @machine = machine
  def extract(ground) = @machine.extract(ground)
end
# endregion
