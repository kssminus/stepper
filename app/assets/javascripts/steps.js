
$(function() {

  $("#addCollection").click( function (){
    name = $("#collectionName").val();
    $.ajax({
      type: "POST",
      url: "collections",
      data: "name="+name,
      dataType: "JSON",
      success: function (data) {
        window.location = "?dashboard="+name
      }
    });
  });

  
});

$(function () {
  
  var steps_data; //current data the view have
  
  var plot;         //bar graph object
  var plot_legend;  //bar legend object
  var flow;         //flow graph object
  
  //var global_timestamp; //current timestamp not use
  var step_buffer = new Array(); //dataset to be draw in graph
  var last_update = 0;  //the size withdraw at once
  var first_step_id = 0; //bar graph's first step id

  var stat_data;      //flow graph data
  var previousPoint;  //tool tip
  var legend_data = new Array();

  var window_size       = $("#window_size").val();    //the size withdraw at once
  var vertical_polling  = 5000;                       //vertical graph polling interval 
  var flow_threshold    = $("#flow_threshold").val(); //flow threshold 
  var flow_polling      = 5000;                       //flow graph polling interval 
  var flow_period       = $("#flow_period").val();    //flow graph data_period
  var flow_max          = $("#flow_max").val();       //flow graph data_period


  function get_steps(count,timestamp,callback){
    if($("#refresh").attr("checked")){
      var dashboard = getUrlParams().dashboard;
      var params = "";
      
      if (dashboard == undefined)
        dashboard = "";
      
      params += "dashboard="+dashboard;
      if(count != null)params += "&limit="+count;
      if(timestamp != null)params += "&t="+timestamp;
      
      $.ajax({
        type: "GET",
        url: "steps.json",
        data: params,
        dataType: "JSON",
        success: callback
      });
    }
    
  }
  
  function buffering(data){
    if($("#refresh").attr("checked") && data.length > 0){

      i = 0;
      for(;i<data.length;i++){
        if( first_step_id == data[i].si)
          break;
      }

      if(i>0){
        update_last_update(last_update=0);
        for(j=i;j>=0;j--){
          _steps_data = new Array();
          for(k=0;k<window_size;k++){
            if(data[j+k]){
              for( var l = 0; l < (data[j+k].th.length||0);l++){
                _steps_data[l] = _steps_data[l] || [];
                progress = 0;
                span = 0;
                divider = data[j+k].th[data[j+k].th.length-1] - data[j+k].t;
                if(l==0){
                  span = (data[j+k].th[0]-data[j+k].t);
                  progress = data[j+k].progress*( span /divider );
                }else{
                  span = data[j+k].th[l]-data[j+k].th[l-1];
                  progress = data[j+k].progress*(span/divider);
                }
                _steps_data[l][k] = [k, progress , data[j+k].si, data[j+k].t, span];
              }
            }
          }
          step_buffer.push(_steps_data);
        }

      }else if(i==0){
        _steps_data = new Array();
        for(j = 0; j < window_size; j++){
          for(k = 0; k < data[j].th.length;k++){
            _steps_data[k] = _steps_data[k] || [];
            progress = 0;
            span = 0;
            divider = data[j].th[data[j].th.length-1] - data[j].t;
            if(k==0){
              span = data[j].th[0]-data[j].t;
              progress = data[j].progress*(span/divider );
            }else{
              span = data[j].th[k]-data[j].th[k-1];
              progress = data[j].progress*(span/divider);
            }
            _steps_data[k][j] = [j, progress , data[j].si, data[j].t, span];
          }
        }
        step_buffer.push(_steps_data);
      }
    }
  }
  
  function shift_graph(){
    if(step_buffer.length > 0 && plot){
      steps_data = step_buffer.shift();
      //console.log(steps_data);
     
      //update first_step_id
      if(steps_data[0][0])
        first_step_id = steps_data[0][0][2];
      
      plot.setData(steps_data);
      plot.draw();
      redraw_legend();
    }
  }

  function draw_graph(data){

    steps_data = new Array();
    for( var i = 0; i < data.length; i++){
      for( var j = 0; j < data[i].th.length;j++){
        steps_data[j] = steps_data[j] || [];
        progress = 0;
        span = 0;
        divider = data[i].th[data[i].th.length-1] - data[i].t;
        if(j==0){
          span = data[i].th[0]-data[i].t;
          progress = data[i].progress*(span/divider );
        }else{
          span = data[i].th[j]-data[i].th[j-1];
          progress = data[i].progress*(span/divider);
        }
        steps_data[j][i] = [i, progress , data[i].si, data[i].t, span];
      }
    }
    
    // register first step id
    if(steps_data[0][0])
      first_step_id = steps_data[0][0][2];
    
    if(!plot){ 
      plot = $.plot($("#vertical_graph"), steps_data , {
                series: {
                  stack: true,
                  bars: {
                    show: true, 
                    barWidth: 0.5, 
                  },
                },
                grid: {
                  hoverable: true,
                  clickable: true
                },
                yaxis: {
                  min: -3,
                  max: 110
                }
            });
      
      for(i=0;i<steps_data.length;i++){
        legend_data[i] = new Array();
        legend_data[i].push([0, 100/steps_data.length]);

      }
      plot_legend = $.plot($("#vertical_legend"), legend_data, {
                      series: {
                        stack: true,
                        bars: {
                          show: true, 
                          barWidth: 0.5, 
                        },
                      },
                      yaxis: {
                        show: false,
                        min: -3,
                        max: 110,
                        tickSize: 20
                      },
                      xaxis: {
                        show: true,
                        min: -1,
                        max: 1,
                        tickSize: 2
                      }
                  });
      return;
    }
  }
  
  function update_last_update(past_seconds) {
    var html = Mustache.render($("#lastUpdateTemplate").html(), {past_seconds : past_seconds}); 
    
    $("#vertical_graph_last_update").empty().append(html);
    $("#clock").empty().append(new Date().toLocaleString().replace("일 ", "일<br/>"));
  }

  function recursive(){
    shift_graph();
    setTimeout(recursive, parseInt(vertical_polling/(step_buffer.length+20)));
  }
  
  function redraw_legend(){
    legend_data = new Array();
    for(i=0;i<steps_data.length;i++){
        legend_data[i] = new Array();
        legend_data[i].push([0, 100/steps_data.length]);
    }
    plot_legend.setData(legend_data);
    plot_legend.draw();
  }
  
  get_steps(window_size, null, draw_graph);
  setInterval(function(){get_steps(window_size*2, null, buffering)}, vertical_polling);
  recursive();
  //setInterval(function(){get_steps(window_size/2, null, draw_progress);}, 5000);
  setInterval(function(){update_last_update(++last_update)}, 1000);
  
  // select box event binding
  $("#window_size").bind("change", function() { 
    window_size = parseInt($(this).val());
    plot = null;
    get_steps(window_size, null, draw_graph);
  });


  //tooltip function
  function showTooltip(x, y, contents, areAbsoluteXY) {
      var rootElt = 'body';

      $('<a href="#" id="tooltip" class="tooltip-with-bg well" data-toggle="tooltip" data-placement="top">' + contents + '</a>').css( {
          position: 'absolute',
          display: 'none',
          'z-index':'1010',
          top: y,
          left: x
      }).prependTo(rootElt).show();
  }

  //add tooltip event
  $("#vertical_graph").bind("plothover", function (event, pos, item) {
      if (item) {
          if (previousPoint != item.datapoint) {
              previousPoint = item.datapoint;
              //delete de précédente tooltip
              $('.tooltip-with-bg ').remove();
              var x = steps_data[item.seriesIndex][item.datapoint[0]][2];
              var span = steps_data[item.seriesIndex][item.datapoint[0]][4];
              var time = new Date(steps_data[item.seriesIndex][item.datapoint[0]][3]);
              showTooltip(item.pageX+5, item.pageY+5, x +"<br/>"+span+" sec"+"<br/>"+time.toLocaleTimeString());
          }
      }
      else {
          $('.tooltip-with-bg').remove();
          previousPoint = null;
      }
   
  });
 
  $("#vertical_graph").bind("plotclick", function (event, pos, item) {
    if(item){
      $("#vertical_graph_select").val(steps_data[item.seriesIndex][item.datapoint[0]][2]).focus();
    }
   
  });

/*-------------*/
/** flow graph**/
/*-------------*/
  function get_stat(count,timestamp,callback){
    if($("#refresh").attr("checked")){
      var dashboard = getUrlParams().dashboard;
      var params = "";
      
      if (dashboard == undefined)
        dashboard = "";
      
      params += "dashboard="+dashboard;
      if(count != null)params += "&limit="+count;
      if(timestamp != null)params += "&t="+timestamp;
      
      $.ajax({
        type: "GET",
        url: "steps/stat.json",
        data: params,
        dataType: "JSON",
        success: callback
      });
    }
    
  }

  function draw_flow(data){
    var series = new Array();
     
    stat_data = data;
    temp_stat = new Array();
    threshold_line = new Array();
    for( var i = 0; i < data.length; i++){
      temp_stat.push([i, data[i].c]);
      threshold_line.push([i, flow_threshold]);
    }

    series.push({
      data: temp_stat,
      color: "rgb(200, 20, 30)",
      threshold: {
        below: flow_threshold ,
        color: "rgb(30, 180, 20)"
      },
      lines: {
        step: true
      }
    });
   
   series.push({
      data: threshold_line,
      color: "rgb(200, 160, 160)",
    });

  
    if(!flow){ 
      flow = $.plot($("#flow_graph"), series, {
            grid: {
              borderWidth: 1,
              minBorderMargin: 20,
              labelMargin: 10,
              backgroundColor: {
                colors: ["#fff", "#e4f4f4"]
              },
              hoverable: true,
              mouseActiveRadius: 50,
              margin: {
                top: 8,
                bottom: 20,
                left: 20
              },
              markings: function(axes) {
                var markings = [];
                var xaxis = axes.xaxis;
                for (var x = Math.floor(xaxis.min); x < xaxis.max; x += xaxis.tickSize * 2) {
                  markings.push({ xaxis: { from: x, to: x + xaxis.tickSize }, color: "rgba(232, 232, 255, 0.2)" });
                }
                return markings;
              }
            },
            yaxis: {
              min: 0,
              max: flow_max
            },
            legend: {
              show: true
            }
        });
        //console.log(flow.getOptions());
        return;
    }
    
    flow.setData(series);
    flow.draw();

  }

  $("#flow_graph").bind("plothover", function (event, pos, item) {
    if (item) {
      if (previousPoint != item.datapoint) {
        previousPoint = item.datapoint;
        
        //delete de précédente tooltip
        $('.tooltip-with-bg').remove();
   
        var x = item.datapoint[1];
        time = new Date(stat_data[Math.round(item.datapoint[0])].t*60*1000);
        showTooltip(item.pageX+5, item.pageY+5, x +"</br>"+time.toLocaleTimeString());
   
      }
    }
    else {
      $('.tooltip-with-bg').remove();
      previousPoint = null;
    }
   
  });

  get_stat(flow_period, null, draw_flow);
  setInterval(function(){get_stat(flow_period, null, draw_flow);}, 60000);

  $("#flow_threshold").bind("change", function() { 
    flow_threshold = parseInt($(this).val());
    flow = null;
    get_stat(flow_period, null, draw_flow);
  });

  $("#flow_period").bind("change", function() { 
    flow_period = parseInt($(this).val());
    flow = null;
    get_stat(flow_period, null, draw_flow);
  });
  
  $("#flow_max").bind("change", function() { 
    flow_max = parseInt($(this).val());
    flow = null;
    get_stat(flow_period, null, draw_flow);
  });




});
