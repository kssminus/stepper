$(function () {
  $("#step").click( function() {
    var step_name = $(this).parent().find(":text");
    if(step_name.val() == ""){
      $("#alert").empty();
      $("#alert").append(Mustache.render($("#alert_template").html(), { level:"error", msg:"스텝 이름은 꼭넣어야 합니다."}));
      return;
    }
    var max_step = $(this).parent().find("option:selected");
    var urlparams = getUrlParams(); 
    var dashboard = urlparams.dashboard;
    //console.log(dashboard);
    $.ajax({
      type: "POST",
      url: "/steps",
      data: "dashboard="+dashboard+"&si="+step_name.val()+"&ms="+max_step.val(),
      dataType: "JSON",
      success: function (data) {
        $("#alert").empty();
        $("#alert").append(Mustache.render($("#alert_template").html(), { level:"success", msg:"최대 "+max_step.val()+"단계짜리 "+step_name.val()+"스텝이 등록되었습니다"}));
        step_name.val("");
        max_step.val("1");
      }
    });
  });
  
  $("#stepup").click( function() {
    var step_name = $(this).parent().find(":text");
    var urlparams = getUrlParams(); 
    var dashboard = urlparams.dashboard;
    //console.log(dashboard);

    //console.log(step_name);
    if(step_name.val() == ""){
      $("#alert").empty();
      $("#alert").append( Mustache.render( $("#alert_template").html(), { level:"error", msg:"스텝 이름은 꼭넣어야 합니다."}));
      return;
    }
    $.ajax({
      type: "POST",
      url: "/stepup",
      data: "dashboard="+dashboard+"&si="+step_name.val(),
      dataType: "JSON",
      success: function (data) {
        $("#alert").empty();
        $("#alert").append(Mustache.render($("#alert_template").html(), { level:"success", msg: step_name.val()+"스텝이 한단계 올렸습니다."}));
      }
    });
  });

});
