const path = require('path');
const { Log } = require('cas-common-lib');
const serverConfig = require('./server-config');

// Add functions to String prototype
//
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.titleCase = function() {
  let splitStrArray = this.toLowerCase().split(" ");
  for (let i = 0; i < splitStrArray.length; ++i) {
    splitStrArray[i] = splitStrArray[i].charAt(0).toUpperCase() + splitStrArray[i].slice(1);
  }
  return splitStrArray.join(" ");
}

// initialize log file paths and showConsole variable
//
Log.initialize(
  path.join(__dirname, serverConfig.CustomErrorLogPath),
  undefined,
  process.env.NODE_ENV !== "production"
);