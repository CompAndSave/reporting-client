function passToken(token, contextPath) {
  let result = new Promise((resolve, reject) => ajaxCall("POST", `${contextPath}/auth/callback`, { token: token }, resolve, reject));

  result.then(() => {
    alert("Action: OAuth Success");
    location.replace(`${contextPath}/`);
  }).catch(err => {
    alert("Action: OAuth Failed");
    console.log(err);
  });
}