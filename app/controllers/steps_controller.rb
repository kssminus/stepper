class StepsController < ApplicationController
  
  def index
    params[:limit] ||= 20
    @dashboards = Dashboard.all
    Step.set_collection_name(dashboard_to_collection(params[:dashboard]))
    #Step.set_collection_name("mouth_test")
    
    if params[:t].nil?  
      steps = Step.where(:t.gte => 1.day.ago.to_i*1000)
                  .limit(params[:limit])
                  .sort(:t.desc)
    else
      steps = Step.where(:t.gt => params[:t].to_i).limit(params[:limit].to_i).sort(:t.desc)
    end

    @steps = Array.new()
    steps.each { |s| s.stuff;@steps << s; }
    
    respond_to do |format|
      format.html
      format.json { render json: @steps }
    end

  end
  
  def stat
    params[:limit] ||= 60
    Stat.set_collection_name(dashboard_to_collection(params[:dashboard])+"_stat")
    
    if params[:limit].nil?  
      @stats = Stat.where(:t.gte => (1.hour.ago.to_i/60).to_i).limit(params[:limit].to_i).sort(:t.desc)
    else
      @stats = Stat.where(:t.gt => (1.day.ago.to_i/60).to_i).limit(params[:limit].to_i).sort(:t.desc)
    end

    respond_to do |format|
      format.json { render json: @stats }
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
