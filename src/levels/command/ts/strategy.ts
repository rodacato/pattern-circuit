
// A cancellation strategy is useless if the action already ran.
// region: CancelStrategy
class CancelStrategy {
  call(request: OrderRequest) { throw new Error('There is nothing to apply the strategy to: the order already ran') }
}
// endregion
