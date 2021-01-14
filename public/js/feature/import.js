function importData(data, contextPath, wait, isHosted) {
  let result = new Promise((resolve, reject) => ajaxCall("POST", `${contextPath}/import`, data, resolve, reject));
  let messageWrapper = document.getElementById('authResMessage');
  result.then((data) => {
    if (isHosted) {
      messageWrapper.className= "callout success";
      messageWrapper.innerHTML= "Report data has been successfuly updated.";
      messageWrapper.style.display = "block";
    }
    else { location.href = `${contextPath}/import/status/${data.id}?wait=${wait}`; } 
  }).catch(err => {
    messageWrapper.className= "callout alert";
    messageWrapper.innerHTML= "Report data update failed. " + err.message;
    messageWrapper.style.display = "block";
  });
}