var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

// GET /test
router.get('/', asyncHandler(async (req, res, next) => {
  const poolData = {
    UserPoolId: process.env.AWS_COGNITO_USERPOOL_ID,
    ClientId: process.env.AWS_COGNITO_NODE_APP_CLIENT_ID
  };
  const pool_region = process.env.AWS_COGNITO_POOL_REGION;
  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
       Username: process.env.AWS_COGNITO_USERNAME,
       Password: process.env.AWS_COGNITO_PASSWORD
  });
  const userData = {
       Username: process.env.AWS_COGNITO_USERNAME,
       Pool: userPool
  }

  let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  let refreshtoken, accesstoken;
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      accesstoken = result.getAccessToken().getJwtToken();
      refreshtoken = result.getRefreshToken().getToken();

      res.setHeader("Set-Cookie", `AWSCognition_accessToken=${accesstoken}; HttpOnly`);
      res.setHeader("Set-Cookie", `AWSCognition_refreshToken=${refreshtoken}; HttpOnly`);

      // var token = new AmazonCognitoIdentity.CognitoRefreshToken({ RefreshToken: refreshtoken });
      // cognitoUser.refreshSession(token, (err, session) => {
      //   if (session) { console.log(session); }
      //   else if (err) { console.log(err); }
      // });
      res.json("test");
    },
    onFailure: (function (err) {
      console.log(err);
      res.json("fail");
    })
  });
}));

// GET /test/auth
router.get('/auth', asyncHandler(async (req, res, next) => {
  const authDomain = process.env.AWS_COGNITO_OAUTH_DOMAIN;
  const clientId = process.env.AWS_COGNITO_HOST_APP_CLIENT_ID;
  const scope = process.env.AWS_COGNITO_SCOPE;
  const callBackUrl = process.env.AWS_COGNITO_CALLBACK_URL;

  let redirect_url = `${authDomain}/login?client_id=${clientId}&scope=${scope}&redirect_uri=${callBackUrl}`;
  res.render('layout/defaultView', {
    meta_title: 'OAuth',
    body_content: 'oauth',
    redirect_url: redirect_url + "&response_type=token",
    auth_code_redirect_url: redirect_url + "&response_type=code"
  });
}));

module.exports = router;