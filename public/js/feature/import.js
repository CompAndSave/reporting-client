function importData(data, contextPath, wait, isHosted) {
  let result = new Promise((resolve, reject) => ajaxCall("POST", `${contextPath}/import`, data, resolve, reject));

  result.then((data) => {
    if (isHosted) {
      alert("Action: Import Success, see console.log for details");
      console.log(data);
    }
    else { location.href = `${contextPath}/import/status/${data.id}?wait=${wait}`; } 
  }).catch(err => {
    alert("Action: Import Failed, see console.log for details");
    console.log(err);
  });
}