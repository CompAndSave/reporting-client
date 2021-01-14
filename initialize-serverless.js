const Cognito = require('aws-cognito-ops');
const AsyncApiQueue = require('async-api-queue');
const Report = require('./classes/Report');
const ImportData = require('./classes/ImportData');
const serverConfig = require('./server-config.json');

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

// initialize Congito static variables
//
Cognito.authDomain = process.env.AWS_COGNITO_OAUTH_DOMAIN;
Cognito.clientId = process.env.NODE_ENV === "production" ? process.env.AWS_COGNITO_NODE_APP_CLIENT_ID : process.env.STG_AWS_COGNITO_NODE_APP_CLIENT_ID;
Cognito.scope = process.env.AWS_COGNITO_SCOPE;
Cognito.callBackUrl = process.env.NODE_ENV === "production" ? process.env.AWS_COGNITO_CALLBACK_URL : process.env.STG_AWS_COGNITO_CALLBACK_URL;
Cognito.accessTokenExp = process.env.AWS_COGNITO_ACCESSTOKEN_EXP;
Cognito.refreshTokenExp = process.env.AWS_COGNITO_REFRESHTOKEN_EXP;
Cognito.pool_region = process.env.AWS_COGNITO_POOL_REGION;
Cognito.defaultContextPath = serverConfig.ContextPath;
Cognito.defaultCookieDomain = process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : process.env.STG_COOKIE_DOMAIN;
Cognito.poolData = {
  UserPoolId: process.env.AWS_COGNITO_USERPOOL_ID,
  ClientId: process.env.NODE_ENV === "production" ? process.env.AWS_COGNITO_NODE_APP_CLIENT_ID : process.env.STG_AWS_COGNITO_NODE_APP_CLIENT_ID
};

// initialize the Report API url
//
Report.apiUrl = process.env.NODE_ENV === "production" ? process.env.REPORT_API_URL_PROD : process.env.REPORT_API_URL_STG;

// initialize the ImportData API url
//
ImportData.apiUrl = process.env.NODE_ENV === "production" ? process.env.REPORT_API_URL_PROD : process.env.REPORT_API_URL_STG;

// initalize AsyncApiQueue
// it will be used for async import endpoint for queueing control, the queue size should be one
//
AsyncApiQueue.initialize(process.env.REDIS_URL, process.env.NODE_ENV === "production" ? serverConfig.AsyncApiRedisPrefix : `STG_${serverConfig.AsyncApiRedisPrefix}`, 1);

// catching signals and clean up connections
// note: SIGKILL is not working at linux environment.
//
['SIGHUP', 'SIGINT', 'SIGILL', 'SIGABRT', 'SIGPIPE', 'SIGBREAK',
 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM', 'exit'
].forEach(signal => {
  process.on(signal, () => {
    AsyncApiQueue.close();
    console.log(`Exit ${signal} - Redis disconnected on app termination`);
    process.exit(0);
  });
});