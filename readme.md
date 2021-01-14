# Report client for MailChimp and Google Analytics Data
### Features:
 - Display MailChimp and Google Analytics Data in tabulator form
 - Import data form for user
 - Light / dark theme switch
 - Support Authentication via AWS Cognito Authorization Code (refresh session token supported) or Implicit Grant
 - Hosted and serverless application (via AWS Application Load Balancer) supported
 - Sample files and documentation to CI/CD deployment (serverless) at AWS included

### Minimum Requirement:
- Node v12.16.x
- MongoDB v4.2.x
- Data endpoint from [MailChimp API service app](https://github.com/lubu12/mailchimp-api)

### Hosted Setup

#### Before start:
- Install all dependencies `npm i`

#### Run the app
- `npm start`

#### Development
Use `nodemon` - https://www.npmjs.com/package/nodemon
```
npm i nodemon -g
nodemon
```

#### Production
Use `pm2` - https://www.npmjs.com/package/pm2
```
npm i pm2 -g
pm2 start ./bin/www
```
OR
```
pm2 start ecosystem.config.js
```
Ref: https://pm2.keymetrics.io/docs/usage/application-declaration/

### Serverless CI/CD Setup
Serverless will use the file `app-serverless.js` and `initialize-serverless.js`. It won't generate the log file. Instead, the error will be displayed at console and streamed to AWS CloudWatch.

Our serverless application is deployed via [Serverless](https://www.serverless.com/). Sample configuration can be found at `sample-serverless.yml` and `sample-serverless-config.js`.  The configuration is based on AWS. Public traffic will hit ALB (Application Load Balancer) and route to Target Group which is connected to Lambda function hosting this client app. GET request is made via API Gateway synchronously.  Since API Gateway is having maximum timeout of 29 seconds, the POST request for data import won't be enough for synchronous call.  We create the asynchronous call setting by using API Gateway, SQS, SNS and Elasticache (Redis).

POST endpoint for MailChimp API service is added at API Gateway which is integrated with SQS. After the request is received at API Gateway, it will be added to SQS queue which is having Lambda trigger set up.  Acknowledgement response will be sent to client. POST request will be forwarded to MailChimp API service at Lambda for processing.  After the request is done processing, it will send a message to SNS which is subscribed by the client (Lambda). Client will consume the SNS message and show the result to user.

Asynchronous calls are managed by the library of [async-api-queue](https://github.com/lubu12/async-api-queue). It is using Elasticache (Redis) to store the queue data, and it can support the multiple-instance behavior at Lambda.

The whole design uses AWS API Gateway (API endpoint managment), Lambda (serverless), Congito (API endpoint authentication), CloudFormation (stack), SNS, SQS, Elasticache (async call management) and S3 (artifact).  We use HTTP API instead of REST API for better performance and lower cost.

Sample CI/CD configuration file and references are included for setting up better development environment. We are using AWS CodePipeline, CodeBuild, CodeCommit, Application Load Balancer, SNS, Serverless and GitHub.

#### CI/CD Pipeline Structure:
Sources are from GitHub (public) and CodeCommit (private).  Environment variable file, `serverless.yml` and `serverless-config.js` are stored at CodeCommit. `.env`, `serverless.yml` and `serverless-config.js` are needed to be copied to primary source which is fetched from GitHub before generating the build artifact.  Commands can be found at `sample-buildspec.yml`.

Below is a sample `.env` file.
```
NODE_ENV = development
REPORT_API_URL_STG = YOUR_STAGING_MAILCHIMP_API_ENDPOINT
REPORT_API_URL_PROD = YOUR_PRODUCTION_MAILCHIMP_API_ENDPOINT
REPORT_API_URL_LOCAL = YOUR_LOCAL_MAILCHIMP_API_ENDPOINT
AWS_COGNITO_USERPOOL_ID = YOUR_COGNITO_USERPOOL_ID
AWS_COGNITO_POOL_REGION = YOUR_AWS_REGION
AWS_COGNITO_NODE_APP_CLIENT_ID = YOUR_PRODUCTION_AWS_COGNITO_APP_CLIENT_ID
STG_AWS_COGNITO_NODE_APP_CLIENT_ID = YOUR_STAGING_AWS_COGNITO_APP_CLIENT_ID
LOCAL_AWS_COGNITO_NODE_APP_CLIENT_ID = YOUR_LOCAL_AWS_COGNITO_APP_CLIENT_ID
AWS_COGNITO_USERNAME = YOUR_AWS_COGNITO_USERNAME
AWS_COGNITO_PASSWORD = YOUR_AWS_COGNITO_PASSWORD
AWS_COGNITO_OAUTH_DOMAIN = YOUR_AWS_COGNITO_OAUTH_DOMAIN
AWS_COGNITO_SCOPE = YOUR_AWS_COGNITO_SCOPE
AWS_COGNITO_CALLBACK_URL = YOUR_PRODUCTION_AWS_COGNITO_CALLBACK_URL
STG_AWS_COGNITO_CALLBACK_URL = YOUR_STAGING_AWS_COGNITO_CALLBACK_URL
LOCAL_AWS_COGNITO_CALLBACK_URL = YOUR_LOCAL_AWS_COGNITO_CALLBACK_URL
AWS_COGNITO_ACCESSTOKEN_EXP = 3600
AWS_COGNITO_REFRESHTOKEN_EXP = 2592000
COOKIE_DOMAIN = YOUR_PRODUCTION_COOKIE_DOMAIN
STG_COOKIE_DOMAIN = YOUR_STAGING_COOKIE_DOMAIN
LOCAL_COOKIE_DOMAIN = YOUR_LOCAL_COOKIE_DOMAIN
REDIS_URL = YOUR_REDIS_CACHE_ENDPOINT
```

#### AWS Cognito Setup References:
- https://medium.com/@janitha000/authentication-using-amazon-cognito-and-nodejs-c4485679eed8
- https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html
- https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-integration.html

#### Serverless Setup References:
- https://www.serverless.com/framework/docs/providers/aws/guide/serverless.yml/
- https://www.serverless.com/blog/serverless-express-rest-api
- https://www.serverless.com/blog/serverless-api-gateway-domain
- https://www.serverless.com/framework/docs/providers/aws/events/apigateway/#http-endpoints-with-custom-authorizers
- https://www.serverless.com/blog/aws-http-api-support
- https://www.serverless.com/blog/serverless-express-apis-aws-lambda-http-api
- https://www.serverless.com/framework/docs/providers/aws/guide/packaging/
- https://www.jeremydaly.com/serverless-consumers-with-lambda-and-sqs-triggers/
- https://www.serverless.com/blog/aws-lambda-sqs-serverless-integration
- https://codeburst.io/100-serverless-asynchronous-api-with-apig-sqs-and-lambda-2506a039b4d

#### CI/CD with Serverless References:
- https://medium.com/quantica/setup-ci-cd-pipeline-with-aws-lambda-and-serverless-framework-f624773f355e
- https://medium.com/quantica/setup-ci-cd-pipeline-with-aws-lambda-and-the-serverless-framework-313a5d3b6001
- https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html#build-spec-ref-example