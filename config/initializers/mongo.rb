## 몽고 맵퍼 초기 설정

config  = YAML::load(File.open("#{::Rails.root}/config/mongo.yml"))
env     = ENV['RAILS_ENV']

MongoMapper.connection = Mongo::Connection.new(config[env]['host'], config[env]['port'])
#MongoMapper.database = "#myapp-#{Rails.env}"
MongoMapper.database = config[env]['database']

if defined?(PhusionPassenger)
   PhusionPassenger.on_event(:starting_worker_process) do |forked|
     MongoMapper.connection.connect if forked
   end
end
