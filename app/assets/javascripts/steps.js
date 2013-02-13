
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

/* vertical bars */
$(function () {
  
  var steps_data; //current data the view have
  var plot;       //graph object
  var global_timestamp; //current timestamp not use
  var step_buffer = new Array(); //dataset to be draw in graph
  var window_size = 150;  //the size withdraw at once
  var last_update = 0;  //the size withdraw at once
  
  var flow;       //flow graph object
  var stat_data;      //flow graph data
  var previousPoint;  //tool tip

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
    if($("#refresh").attr("checked")){
      
      i = 0;
      for(;i<data.length;i++){
        if(steps_data[0][2] == data[i].si)
          break;
      }

      if(i>0)
        update_last_update(last_update=0);

      for(j=i;j>=0;j--){
        snapshot = new Array();
        for(k=0;k<window_size;k++){
          snapshot.push([k, data[j+k].progress, data[j+k].si]);
        }
        step_buffer.push(snapshot);
      }
    }
    
    
  }
  
  function shift_graph(){
    if(step_buffer.length > 0){
      bar_graph = new Array();
      steps_data = step_buffer.shift();
          
      bar_graph.push({
        lavel: "foo",
        data: steps_data,
        bars: {
          show: true, 
          barWidth: 0.5, 
          order: 1,
          lineWidth : 2
        }
      });
      
      plot.setData(bar_graph);
      plot.draw();
    }
  }

  function draw_graph(data){
    var bar_graph = new Array();
    
    if(data.length > 0)global_timestamp = data[0].t
    
    steps_data = [];
    for( var i = 0; i < data.length; i++){
      steps_data.push([i, data[i].progress, data[i].si]);
    }
   
    bar_graph.push({
      data: steps_data,
      bars: {
        show: true, 
        barWidth: 0.5, 
        order: 1,
        lineWidth : 2
      }
    });
    
    if(!plot){ 
      plot = $.plot($("#vertical_graph"), bar_graph, {
                grid: {
                  hoverable: true,
                  clickable: true
                }
            });
      return;
    }
  }
  
  function draw_progress(data) {
    var stat = Mustache.render($("#stepTemplate").html(), { steps : data }); 
    
    $("#progresses").empty().append(stat);
  }
  
  function update_last_update(past_seconds) {
    var html = Mustache.render($("#lastUpdateTemplate").html(), {past_seconds : past_seconds}); 
    
    $("#vertical_graph_last_update").empty().append(html);
  }

    
  get_steps(window_size, null, draw_graph);
  setInterval(function(){get_steps(window_size*2, null, buffering)}, 5000);
  setInterval(function(){get_steps(window_size/2, null, draw_progress);}, 5000);
  setInterval(shift_graph, 100);
  setInterval(function(){update_last_update(++last_update)}, 1000);

  //tooltip function
  function showTooltip(x, y, contents, areAbsoluteXY) {
      var rootElt = 'body';

      $('<a href="#" id="tooltip" class="tooltip-with-bg" data-toggle="tooltip" data-placement="top">' + contents + '</a>').css( {
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
              $('.tooltip-with-bg').remove();
   
              var x = item.datapoint[0];
   
              //All the bars concerning a same x value must display a tooltip with this value and not the shifted value
              if(item.series.bars.order){
                  x = item.series.data[item.dataIndex][2]
                  //for(var i=0; i < item.series.data.length; i++){
                  //    if(item.series.data[i][3] == item.datapoint[0])
                  //        x = item.series.data[i][0];
                  //}
              }
   
              var y = item.datapoint[1];
              
              showTooltip(item.pageX+5, item.pageY+5,x + "::" + y +"%");
   
          }
      }
      else {
          $('.tooltip-with-bg').remove();
          previousPoint = null;
      }
   
  });
 
  $("#vertical_graph").bind("plotclick", function (event, pos, item) {
    if(item){
      $("#vertical_graph_select").val(item.series.data[item.dataIndex][2]).focus();
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
    temp_stat = [];
    for( var i = 0; i < data.length; i++){
      temp_stat.push([i, data[i].c]);
    }

    series = [{
      data: temp_stat,
      lines: {
        fill: true
      }
    }];

  
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
              max:50
            },
            legend: {
              show: true
            }
        });
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
   
        var y = item.datapoint[1];
        timestr = new Date(stat_data[item.datapoint[0]].t*60*1000);
        showTooltip(item.pageX+5, item.pageY+5, y +"</br>"+timestr.toLocaleTimeString());
   
      }
    }
    else {
      $('.tooltip-with-bg').remove();
      previousPoint = null;
    }
   
  });

  get_stat(60, null, draw_flow);
  setInterval(function(){get_stat(60, null, draw_flow);}, 60000);

});
