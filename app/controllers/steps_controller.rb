class StepsController < ApplicationController
  
  def index
    
    #Step.set_collection_name("mouth_test")
    #tmp = Step.create( si: "abcd", t: Time.now.to_i, sm: 10, cs: 0)
    #tmp.save
    
     
    @steps = Step.all()
    respond_to do |format|
      format.html { render json: @steps }
    end

  end


end
