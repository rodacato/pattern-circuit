
// An intermediary that controls access to the machine… without fixing what the app skips.
// region: EspressoMachineProxy
class EspressoMachineProxy {
  constructor(private machine: EspressoMachine) {}
  extract(ground: string) { return this.machine.extract(ground) }
}
// endregion
