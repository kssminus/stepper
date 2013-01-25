function refresh() {
  if($("#refresh").attr("checked")){
    window.location.reload();
  }
}

setTimeout(refresh, 5000);

