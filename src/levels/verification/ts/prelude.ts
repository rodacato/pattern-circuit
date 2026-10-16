// The same outside world as prelude.rb, for TypeScript: things the examples talk to but never define.
const quiet: any = new Proxy({}, { get: () => () => quiet })
const CardTerminal = quiet
const CashDrawer = quiet
const VoucherBook = quiet
const Stripe = quiet
const PG = quiet
const HTTP = quiet
const barista: any = { prepare() {} }

class PayHandler { apply() { return 'done' } }
class PrepareHandler { apply() { return 'done' } }
class DeliverHandler { apply() { return 'done' } }
class CancelHandler { apply() { return 'done' } }
