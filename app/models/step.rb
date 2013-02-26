class Step
  include MongoMapper::Document
  
  key :si, String
  key :t, Integer, :default => Time.now.to_i
  key :ms, Integer, :default => 1
  key :cs, Integer, :default => 0
  key :status, String, :default => "danger" 
  key :progress, Float, :default => 0.0
  key :th, :default => Array.new()
  attr_accessible :si, :ms, :t, :ms, :cs, :th, :status, :progress
 
  def stuff
    if (cs.to_f/ms.to_f)*100 >= 100 
      @progress = 100 
    else
      @progress = (cs.to_f/ms.to_f)*100
    end
    
    
    if cs.eql? ms
      @status = "success"
    elsif t >= 1.minute.ago.to_i 
      @status = "info"
    elsif t >= 3.minutes.ago.to_i 
      @status = "warning"
    elsif t >= 5.minutes.ago.to_i
      @status =  "danger"
    end
  end

end
