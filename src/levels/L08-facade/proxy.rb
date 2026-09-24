
# Un intermediario que controla el acceso a la máquina… sin arreglar lo que la app se salta.
# region: EspressoMachineProxy
class EspressoMachineProxy
  def initialize(machine) = @machine = machine
  def extract(ground) = @machine.extract(ground)
end
# endregion
