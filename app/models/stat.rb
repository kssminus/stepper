class Stat
  include MongoMapper::Document
  
  key :t, Integer, :default => Time.now.to_i/60
  key :c, Integer, :default => 0

  attr_accessible :t, :c
 
end
