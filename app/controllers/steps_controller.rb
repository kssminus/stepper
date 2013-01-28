class StepsController < ApplicationController
  
  def index
    
    @dashboards = Dashboard.all
    if params[:dashboard]
      @dashboard = "stepper_#{params[:dashboard]}"
    else
      @dashboard = "stepper_default"
    end
    Step.set_collection_name(@dashboard)
    #Step.set_collection_name("mouth_test")
    
     
    @steps = Step.sort(:t.desc).limit(20)
    @steps.sort do |a,b|
      b.progress <=> a.progress
    end
    Rails.logger.info @steps.inspect
    #Rails.logger.info @steps[0].progress
    respond_to do |format|
      format.html
      format.json { render json: @steps }
    end

  end


end
