module.exports.getNodeEnv = (serverless) => {
  serverless.cli.consoleLog(`getNodeEnv: stage is ${serverless.variables.options.stage}`);
  return serverless.variables.options.stage === "prod" ? "production" : "development";
};

module.exports.getAlbPriority = (serverless) => {
  serverless.cli.consoleLog(`getAlbPriority: stage is ${serverless.variables.options.stage}`);

  // return the priority for ALB listener rule - E.g., 3 for production and 2 for staging target group
  //
  return serverless.variables.options.stage === "prod" ? 3 : 2;
};

module.exports.getAlbHost = (serverless) => {
  serverless.cli.consoleLog(`getAlbHost: stage is ${serverless.variables.options.stage}`);

  // return the host for ALB listener rule - production and staging target group
  //
  return serverless.variables.options.stage === "prod" ? "YOUR_PRODUCTION_DOMAIN" : "YOUR_STAGING_DOMAIN";
};