function ajaxCall(type, url, data, resolve, reject) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    try {
      if (this.readyState === 4 && this.status === 200) { resolve(JSON.parse(this.responseText)); }
      else if (this.readyState === 4 && this.status !== 200) { reject(JSON.parse(this.responseText)); }
    }
    catch (e) { reject(e); }
  };
  xhttp.open(type, url, true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify({ data: data }));
}