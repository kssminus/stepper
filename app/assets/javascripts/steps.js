
function refresh() {
  var dashboard = getUrlParams().dashboard;
  if (dashboard == undefined)
    dashboard = "";
  //console.log($("#refresh").attr("checked"));
  if($("#refresh").attr("checked")){
    $.ajax({
      type: "GET",
      url: "steps.json",
      data: "dashboard="+dashboard,
      dataType: "JSON",
      success: reload_board
    });
    
    function reload_board(data) {
      var stat = Mustache.render($("#stepTemplate").html(), { steps : data }); 
      $("#progresses").empty().append(stat);
      //console.log(stat);
      setTimeout(refresh, 5000);
    }

  }
}

setTimeout(refresh, 5000);


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
