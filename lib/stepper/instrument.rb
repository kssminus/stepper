require 'socket'
require 'benchmark'

module Stepper
  unless self.respond_to?(:measure)
    class << self
      attr_accessor :daemon_host, :daemon_port, :disabled
      
      # Mouth.server = 'localhost:1234'
      def daemon_hostport=(hostport)
        self.daemon_host, port = hostport.split(':')
        self.daemon_port = port.to_i
      end
      
      def daemon_host
        @daemon_host || "localhost"
      end
      
      def daemon_port
        @daemon_port || 8889
      end
      
      def step(key, value, file = nil)
        write(key, value, :s, nil, file)
      end

      def stepup(key, delta = 1, file = nil)
        write(key, delta, :su, nil, file)
      end

      protected

      def socket
        @socket ||= UDPSocket.new
      end

      def write(k, v, op, sample_rate = nil, file = nil)
        return if self.disabled
        if sample_rate
          sample_rate = 1 if sample_rate > 1
          return if rand > sample_rate
        end
        
        command = "#{k}:#{v}|#{op}"
        command << "|@#{sample_rate}" if sample_rate
        
        if file
          File.open(file, "a") do |f|
            f.puts(command)
          end
        else
          socket.send(command, 0, self.daemon_host, self.daemon_port) 
        end
      end
    end
  end
end
