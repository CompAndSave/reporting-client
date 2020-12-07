var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');
const Cognito = require('aws-cognito-ops');

// GET /auth
router.get('/', asyncHandler(async (req, res, next) => {
  res.render('layout/defaultView', {
    meta_title: 'OAuth',
    body_content: 'oauth',
    redirect_url: Cognito.implictGrantUrl,
    auth_code_redirect_url: Cognito.authCodeGrantUrl
  });
}));

// GET /auth/callback
router.get('/callback', asyncHandler(async (req, res, next) => {

  // Authorization Code Grant Type
  //
  if (req.query.code) {
    let tokens = await Cognito.getTokens(req.query.code);
    Cognito.setCookie(res, tokens.accessToken, tokens.refreshToken);
    res.redirect("/");
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

// POST /auth/callback
// For Implict Grant
//
router.post('/callback', asyncHandler(async (req, res, next) => {
  let accessToken = Cognito.getAccessTokenCallback(req.body.data.token);
  if (!accessToken) { return res.status(400).json({ message: "oauth-failed-no-access-token-return" }); }
  Cognito.setCookie(res, accessToken);
  res.json({ success: true });
}));

module.exports = router;