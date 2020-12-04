var express = require('express');
var router = express.Router();
const axios = require('axios');
const qs = require('qs');
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

// GET /test/callback
router.get('/callback', asyncHandler(async (req, res, next) => {

  // Authorization Code Grant Type
  //
  if (req.query.code) {
    const authDomain = process.env.AWS_COGNITO_OAUTH_DOMAIN;
    const clientId = process.env.AWS_COGNITO_HOST_APP_CLIENT_ID;
    const clientSecret = process.env.AWS_COGNITO_HOST_APP_CLIENT_SECRET;
    const callBackUrl = process.env.AWS_COGNITO_CALLBACK_URL;

    let authorizationCode = req.query.code;
    let authorizationHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    let response = await axios({
      method: "post",
      url: `${authDomain}/oauth2/token`,
      data: qs.stringify({
        grant_type: "authorization_code",
        code: authorizationCode,
        redirect_uri: callBackUrl
      }),
      headers: {
        'Authorization': `Basic ${authorizationHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.data || !response.data.access_token || !response.data.refresh_token) {
      res.status(400).render('layout/defaultView', {
        meta_title: 'OAuth Error',
        body_content: 'error',
        error: {
          message: "Missing access or refresh token!"
        }
      });
    }
    else {
      res.setHeader("Set-Cookie", `AWSCognition_accessToken=${response.data.access_token}; AWSCognition_refreshToken=${response.data.refresh_token}; Path=/; HttpOnly`);
      res.redirect("/");
    }
  }
  // Implict Code Grant Type
  //
  else {
    res.render('layout/defaultView', {
      meta_title: 'OAuth',
      body_content: 'oauth'
    });
  }
}));

// POST /test/callback
router.post('/callback', asyncHandler(async (req, res, next) => {
  let match = req.body.data.token.match(/&access_token=(.*)&expires_in=3600&token_type=Bearer$/);
  if (!match) { return res.status(400).json({ message: "oauth-failed-no-access-token-return" }); }

  res.setHeader("Set-Cookie", `AWSCognition_accessToken=${match[1]}; Path=/; HttpOnly`);
  res.json({ success: true });
}));

module.exports = router;