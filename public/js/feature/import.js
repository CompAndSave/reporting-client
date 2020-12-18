function importData(data, contextPath, wait) {
  let result = new Promise((resolve, reject) => ajaxCall("POST", `${contextPath}/import`, data, resolve, reject));

  result.then((data) => {
    location.href = `${contextPath}/import/status/${data.id}?wait=${wait}`;
  }).catch(err => {
    alert("Action: Import Failed");
    console.log(err);
  });
}