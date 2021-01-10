const path = require('path');
const { Log } = require('cas-common-lib');
const serverConfig = require('./server-config');
const Cognito = require('aws-cognito-ops');
const Report = require('./classes/Report');

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

// **********************************************************
// Local / host instance will only use SANDBOX variables now
// **********************************************************

// initialize Congito static variables
//
Cognito.authDomain = process.env.AWS_COGNITO_OAUTH_DOMAIN;
Cognito.clientId = process.env.SANDBOX_AWS_COGNITO_NODE_APP_CLIENT_ID;
Cognito.scope = process.env.AWS_COGNITO_SCOPE;
Cognito.callBackUrl = process.env.SANDBOX_AWS_COGNITO_CALLBACK_URL;
Cognito.accessTokenExp = process.env.AWS_COGNITO_ACCESSTOKEN_EXP;
Cognito.refreshTokenExp = process.env.AWS_COGNITO_REFRESHTOKEN_EXP;
Cognito.pool_region = process.env.AWS_COGNITO_POOL_REGION;
Cognito.defaultContextPath = serverConfig.ContextPath;
Cognito.defaultCookieDomain = process.env.SANDBOX_COOKIE_DOMAIN;
Cognito.poolData = {
  UserPoolId: process.env.AWS_COGNITO_USERPOOL_ID,
  ClientId: process.env.SANDBOX_AWS_COGNITO_NODE_APP_CLIENT_ID
};

// initialize the Report API url
//
Report.reportApiUrl = process.env.REPORT_API_URL_SANDBOX;

// initialize log file paths and showConsole variable
//
Log.initialize(
  path.join(__dirname, serverConfig.CustomErrorLogPath),
  undefined,
  process.env.NODE_ENV !== "production"
);