function passToken(token, contextPath) {
  let result = new Promise((resolve, reject) => ajaxCall("POST", `${contextPath}/auth/callback`, { token: token }, resolve, reject));

  let messageWrapper = document.getElementById('authResMessage');

  result.then(() => {
    messageWrapper.className= "callout success";
    messageWrapper.innerHTML= "OAuth success. Please wait while we direct you to your page.";
    messageWrapper.style.display = "block";
    setTimeout(function() {location.replace(`${contextPath}/`)}, 3000);
  }).catch(err => {
    messageWrapper.className= "callout alert";
    messageWrapper.innerHTML= "OAuth Failed. " + err.message;
    messageWrapper.style.display = "block";
  });
}