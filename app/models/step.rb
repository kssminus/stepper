class Step
  include MongoMapper::Document
  
  key :si, String
  key :t, Integer
  key :ms, Integer, :defalut => 1
  key :cs, Integer, :default => 0

  validate :ms_bigger_than_0

  def ms_bigger_than_0
    errors.add(:ms, "Step Max should be bigger than 0") if ms 1 < 0
  end
  def progress
    return (cs.to_f/ms.to_f)*100
  end
end
