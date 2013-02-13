
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
  var window_size = 40;  //the size withdraw at once
  var last_update = 0;  //the size withdraw at once

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
                  hoverable: true
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

  //tooltip function
  function showTooltip(x, y, contents, areAbsoluteXY) {
      var rootElt = 'body';

      $('<div id="tooltip" class="tooltip-with-bg">' + contents + '</div>').css( {
          position: 'absolute',
          display: 'none',
          'z-index':'1010',
          top: y,
          left: x
      }).prependTo(rootElt).show();
  }
  
  get_steps(window_size, null, draw_graph);
  setInterval(function(){get_steps(window_size*2, null, buffering)}, 5000);
  setInterval(function(){get_steps(window_size/2, null, draw_progress);}, 5000);
  setInterval(shift_graph, 200);
  setInterval(function(){update_last_update(++last_update)}, 1000);
  //setInterval(function(){get_steps(40,stuff_steps);}, 5000);
  //setInterval(get_steps, 5000);
    //get_steps();
});

/* basic 
$(function() {

  var container = $("#vertical_graph");

  // Determine how many data points to keep based on the placeholder's initial size;
  // this gives us a nice high-res plot while avoiding more than one point per pixel.

  var maximum = container.outerWidth() / 2 || 300;

  //

  var data = [];

    function getRandomData() {

        if (data.length) {
            data = data.slice(1);
        }

        while (data.length < maximum) {
            var previous = data.length ? data[data.length - 1] : 50;
            var y = previous + Math.random() * 10 - 5;
            data.push(y < 0 ? 0 : y > 100 ? 100 : y);
        }

        // zip the generated y values with the x values

        var res = [];
        for (var i = 0; i < data.length; ++i) {
            res.push([i, data[i]])
        }

        return res;
    }

  //

  series = [{
    data: getRandomData(),
    lines: {
      fill: true
    }
  }];

  //

  var plot = $.plot(container, series, {
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
      max: 110
    },
    legend: {
      show: true
    }
  });

  // Create the demo X and Y axis labels

  var yaxisLabel = $("<div class='axisLabel yaxisLabel'></div>")
    .text("Response Time (ms)")
    .appendTo(container);

  // Since CSS transforms use the top-left corner of the label as the transform origin,
  // we need to center the y-axis label by shifting it down by half its width.
  // Subtract 20 to factor the chart's bottom margin into the centering.

  yaxisLabel.css("margin-top", yaxisLabel.width() / 2 - 20);

  // Update the random dataset at 25FPS for a smoothly-animating chart

  setInterval(function updateRandom() {
    series[0].data = getRandomData();
    console.log(series[0])
    plot.setData(series);
    plot.draw();
  }, 1000);

  console.log(getRandomData());
  console.log(getRandomData());
})
*/
