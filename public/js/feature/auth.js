function passToken(token) {
  let result = new Promise((resolve, reject) => ajaxCall("POST", "/auth/callback", { token: token }, resolve, reject));

  result.then(() => {
    alert("Action: OAuth Success");
    location.replace("/");
  }).catch(err => {
    alert("Action: OAuth Failed");
    console.log(err);
  });
}