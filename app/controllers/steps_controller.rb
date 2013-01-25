class StepsController < ApplicationController
  
  def index
    
    @dashboards = Dashboard.all 
    Step.set_collection_name("stepper_"+params[:dashboard]) unless params[:dashboard].nil?
    #Step.set_collection_name("mouth_test")
    
     
    @steps = Step.all()
    @steps = @steps.sort do |a,b|
      b.progress <=> a.progress
    end
    Rails.logger.info @steps.inspect
    Rails.logger.info @steps[0].progress
    respond_to do |format|
      format.html
    end

  end


end
