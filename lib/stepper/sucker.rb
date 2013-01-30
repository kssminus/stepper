# Mouth의 sucker의 영감을 받아 고친 sucker
# MOuth : https://github.com/cypriss/mouth
require 'em-mongo'
require 'eventmachine'

module Stepper
  class SuckerConnection < EM::Connection
    attr_accessor :sucker
  
    def receive_data(data)
      #Stepper.logger.debug "UDP packet: '#{data}'"
      data = data.to_s()[/[0-9a-zA-Z\.]+:\d+\|\w+$/]
      if data
        Stepper.logger.debug "Stepper UDP: '#{data}'"
        sucker.store!(data)
      else
        Stepper.logger.debug "bad packet!!"
      end
    end
  end
  
  class Sucker
    
    # Host/Port to suck UDP packets on
    attr_accessor :host
    attr_accessor :port

    # Actual EM::Mongo connection
    attr_accessor :mongo
    
    # Info to connect to mongo
    attr_accessor :mongo_db_name
    attr_accessor :mongo_hostports
    
    attr_accessor :steps
    attr_accessor :stepping
    
    # Stats
    attr_accessor :udp_packets_received
    attr_accessor :mongo_flushes
    
    def initialize(options = {})
      self.host = options[:host] || "localhost"
      self.port = options[:port] || 8889
      self.mongo_db_name = options[:mongo_db_name] || "stepper"
      hostports = options[:mongo_hostports] || [["localhost", EM::Mongo::DEFAULT_PORT]]
      self.mongo_hostports = hostports.collect do |hp|
        if hp.is_a?(String)
          host, port = hp.split(":")
          [host, port || EM::Mongo::DEFAULT_PORT]
        else
          hp
        end
      end
      
      self.udp_packets_received = 0
      self.mongo_flushes = 0
      
      self.steps = {}
      self.stepping = {}
    end
    
    def suck!
      EM.run do
        # Connect to mongo now
        self.mongo

        EM.open_datagram_socket host, port, SuckerConnection do |conn|
          conn.sucker = self
        end
        
        EM.add_periodic_timer(5) do
          Stepper.logger.info "Steps: #{self.steps.inspect}"
          Stepper.logger.info "Stepping: #{self.stepping.inspect}"
          self.flush!
          self.set_procline!
        end

        EM.next_tick do
          Stepper.logger.info "Stepper reactor started..."
          self.set_procline!
        end
      end
    end
    
    # steps: safaritour.uuid:4|s
    # stepping: safaritour.uuid:4|su
    def store!(data)
      key_value, command = data.to_s.split("|", 2)
      key, value = key_value.to_s.split(":")
      
      return unless key && value && command && key.length > 0 && value.length > 0 && command.length > 0
      
      key = Stepper.parse_key(key).join(":")
      value = value.to_i
      
      ts  = Time.now.to_i

      if command == "s"
        self.steps[key] ||= {}
        self.steps[key]["t"]  = ts
        self.steps[key]["ms"] = value #MAX STEP
        self.steps[key]["cs"] = 0     #CURRENT STEP
      elsif command == "su"
        self.stepping[key] ||= {}
        self.stepping[key]["t"]   = ts
        self.stepping[key]["cs"]  ||= 0
        self.stepping[key]["cs"]  += value
      end
      
      self.udp_packets_received += 1
    end
    
    def flush!
      ts = Time.now.to_i
      # 5초 전까지 것만 일단 저장한다. 
      limit_ts = ts - 5
      
      # "mycollection:step_id": {
      #   t:  23423433,
      #   ms: 6,
      #   cs: 1
      # }
      #몽고에 저장하는 도중에 들어오는 녀석들 때문에..
      temp_steps = self.steps.clone 
      
      temp_steps.each do |step_key, step_to_save|
        if step_to_save["t"] <= limit_ts
          collection, step_id = step_key.split(":")
          
          # collection 이름 살균
          collection_name = Stepper.mongo_collection_name(collection) 
          step_to_save["si"] = step_id 
          
          #기존에 등록되어 있는것이 있으면 덮어 씌운다.
          self.mongo.collection(collection_name).update({"si"=>step_id}, step_to_save, { :upsert => true } )
          
          self.steps.delete(step_key)
        end
      end
      
      Stepper.logger.info "Saved Steps : #{temp_steps.inspect}" 

      #"mycollectioni:step_id":{ 
      # "$inc":{ 
      #         "cs": 3
      #         } 
      # }
      temp_stepping = self.stepping.clone
      temp_stepping.each do |stepping_key, stepping_to_save|
        if stepping_to_save["t"] <= limit_ts
          collection, step_id = stepping_key.split(":")
          collection_name = Stepper.mongo_collection_name(collection) # collection 이름 살균
         
          #스텝 증가
          self.mongo.collection(collection_name).update({"si"=>step_id},{"$inc"=> { "cs" => stepping_to_save["cs"]}})
          self.stepping.delete(stepping_key)
        end
      end
      
      Stepper.logger.info "Saved Stepping : #{temp_stepping.inspect}" 
      
      self.mongo_flushes += 1
    end
    
    def mongo
      @mongo ||= begin
        if self.mongo_hostports.length == 1
          EM::Mongo::Connection.new(*self.mongo_hostports.first).db(self.mongo_db_name)
        else
          raise "Ability to connect to a replica set not implemented."
        end
      end
    end
    
    def set_procline!
      $0 = "stepper [started] [UDP Recv: #{self.udp_packets_received}] [Mongo saves: #{self.mongo_flushes}]"
    end
    
  end # class Sucker
end # module
