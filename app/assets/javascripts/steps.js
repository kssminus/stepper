
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
  var steps_data;
  var plot;
  var global_timestamp; 
  var step_buffer = new Array(); 
  
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
  
  function stuff_steps(data){
    if($("#refresh").attr("checked")){
      for(var i=0;i<data.length;i++){
        step_buffer.push(data[i]);
      }
      if(data.length > 0)global_timestamp = data[0].t;
    }
    
  }
  
  function shift_graph(){
    console.log(step_buffer.length)
    
    if(step_buffer.length > 0){
      temp_steps_data = new Array();
      bar_graph = new Array();
      new_step = step_buffer.shift();
      
      temp_steps_data.push([0, new_step.cs]); 
   
     for(var i=1;i<steps_data.length;i++)
        temp_steps_data.push([i, steps_data[i-1][1]]);
  
      steps_data = temp_steps_data;
          
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
      steps_data.push([i, data[i].cs]);
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
    plot.setData(bar_graph);
    plot.draw();

  }
  
  function draw_progress(data) {
    var stat = Mustache.render($("#stepTemplate").html(), { steps : data }); 
    
    $("#progresses").empty().append(stat);
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
  get_steps(40, null, draw_graph);
  setInterval(function(){get_steps(20, global_timestamp, stuff_steps);}, 5000);
  setInterval(shift_graph, 500);
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
