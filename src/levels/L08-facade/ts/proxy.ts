
// Un intermediario que controla el acceso a la máquina… sin arreglar lo que la app se salta.
// region: EspressoMachineProxy
class EspressoMachineProxy {
  constructor(private machine: EspressoMachine) {}
  extract(ground: string) { return this.machine.extract(ground) }
}
// endregion
