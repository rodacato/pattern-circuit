# Queueing events as commands doesn't change what is allowed: the queue runs them anyway.
# region: EventQueue
class EventCommand
  def initialize(order, event) = (@order, @event = order, event)
  def execute = @order.handle(@event)
end

class EventQueue
  def push(command) = (@commands ||= []) << command
  def run = @commands.each(&:execute) # runs them in order, whether they make sense or not
end
# endregion
