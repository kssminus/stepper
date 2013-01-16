class MouthStep 
  include MongoMapper::Document

  key :si, String
  key :t, Integer
  key :sm, Integer
  key :cs, Integer, :default => 0

end
