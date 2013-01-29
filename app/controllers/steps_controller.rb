class StepsController < ApplicationController
  
  def index
    
    @dashboards = Dashboard.all
    Step.set_collection_name(dashboard_to_collection(params[:dashboard]))
    #Step.set_collection_name("mouth_test")
    
     
    @steps = Step.sort(:t.desc).limit(20)
    @steps = @steps.sort do |a,b|
      a.progress <  b.progress
    end

    Rails.logger.info @steps.inspect
    #Rails.logger.info @steps[0].progress
    
    respond_to do |format|
      format.html
      format.json { render json: @steps }
    end

  end

  def test
    @dashboards = Dashboard.all
    render :template => "steps/test"
  end

  def create
    
    Step.set_collection_name(dashboard_to_collection(params[:dashboard]))
    @step = Step.new(params)
    @step.t = Time.now()
    @step.save
    render json: @step
  end

  def create_up
    Step.set_collection_name(dashboard_to_collection(params[:dashboard]))

    @result = Step.increment({:si => params[:si]}, :cs => 1)
    render json: @result
  end

  :private
  def dashboard_to_collection(dashboard)
     if dashboard
      "stepper_#{params[:dashboard]}"
    else
      "stepper_default"
    end
    
  end
end
