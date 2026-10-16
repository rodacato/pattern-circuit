# Outside world the examples talk to but never define: payment terminals, databases, the rest of the cafeteria.
# They do nothing and print nothing, so what a snippet outputs is only its own.
module Quiet
  def method_missing(*) = self
  def respond_to_missing?(*) = true
end

%i[CardTerminal CashDrawer VoucherBook Stripe PG HTTP SecureRandomStub].each do |name|
  Object.const_set(name, Module.new { extend Quiet })
end

def barista = Object.new.tap { |b| b.define_singleton_method(:prepare) { |*| nil } }

# Parts of the cafeteria that a snippet mentions but another one defines (the event handlers of the State level).
%i[PayHandler PrepareHandler DeliverHandler CancelHandler].each do |name|
  Object.const_set(name, Class.new { def apply = :done })
end
