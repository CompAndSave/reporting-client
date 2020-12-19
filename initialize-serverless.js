const Cognito = require('aws-cognito-ops');
const AsyncApi = require('./classes/AsyncApi');
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
Cognito.clientId = process.env.AWS_COGNITO_NODE_APP_CLIENT_ID;
Cognito.scope = process.env.AWS_COGNITO_SCOPE;
Cognito.callBackUrl = process.env.AWS_COGNITO_CALLBACK_URL;
Cognito.accessTokenExp = process.env.AWS_COGNITO_ACCESSTOKEN_EXP;
Cognito.refreshTokenExp = process.env.AWS_COGNITO_REFRESHTOKEN_EXP;
Cognito.pool_region = process.env.AWS_COGNITO_POOL_REGION;
Cognito.defaultContextPath = serverConfig.ContextPath;
Cognito.defaultCookieDomain = process.env.COOKIE_DOMAIN;
Cognito.poolData = {
  UserPoolId: process.env.AWS_COGNITO_USERPOOL_ID,
  ClientId: process.env.AWS_COGNITO_NODE_APP_CLIENT_ID
};

console.log(Cognito);

// initalize AsyncApi
// it will be used for async import endpoint for queueing control, the queue size should be one
//
AsyncApi.initialize(process.env.REDIS_URL, serverConfig.AsyncApiRedisPrefix, 1);

// catching signals and clean up connections
// note: SIGKILL is not working at linux environment.
//
['SIGHUP', 'SIGINT', 'SIGILL', 'SIGABRT', 'SIGPIPE', 'SIGBREAK',
 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM', 'exit'
].forEach(signal => {
  process.on(signal, () => {
    AsyncApi.close();
    console.log(`Exit ${signal} - Redis disconnected on app termination`);
    process.exit(0);
  });
});