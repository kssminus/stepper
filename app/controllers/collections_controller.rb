class CollectionsController < ApplicationController
  
  # GET /collections
  def index 

  end
  
  # POST /collections
  def create
    
    dashboard = Dashboard.new(params)
     
    respond_to do |format|
      if dashboard.save
        format.json { render json: dashboard }
      else
        format.json { render json: { "error" => "The error occur while save #{dashboard.to_s}" } } 
      end
    end
  end

  # PUT /collections/:id
  def update

  end

  # DELETE /collections/:id
  def destroy

  end

end
