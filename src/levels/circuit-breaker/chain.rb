class PaymentGateway
  # region: PaymentGateway#charge
  def charge(order) = HTTP.timeout(30).post(PROVIDER_URL, json: order.payment)
  # endregion
end

# Try the provider and, if it fails, move on to the next one: nobody goes uncharged…
# but every customer waits the full timeout, because the chain never stops trying.
# region: FallbackChain#charge
class FallbackChain
  def charge(order)
    PaymentGateway.new.charge(order)
  rescue Timeout::Error
    OfflinePayments.new.charge(order)
  end
end
# endregion
