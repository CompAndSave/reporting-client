var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');
const Cognito = require('aws-cognito-ops');
const serverConfig = require('../server-config.json');

// GET /auth
router.get('/', asyncHandler(async (req, res, next) => {
  res.render('layout/defaultView', {
    meta_title: 'OAuth',
    body_content: 'oauth',
    contextPath: serverConfig.ContextPath,
    redirect_url: Cognito.implictGrantUrl,
    auth_code_redirect_url: Cognito.authCodeGrantUrl
  });
}));

// GET /auth/setAccessTokenCookie - For Authorization Code Grant
router.get('/setAccessTokenCookie', asyncHandler(async (req, res, next) => {
  Cognito.setCookie(res, "accessToken", req.app.locals.accessToken);
  delete req.app.locals.accessToken;
  res.redirect(`${serverConfig.ContextPath}/auth/setRefreshTokenCookie`);
}));

// GET /auth/setRefreshTokenCookie - For Authorization Code Grant
router.get('/setRefreshTokenCookie', asyncHandler(async (req, res, next) => {
  Cognito.setCookie(res, "refreshToken", req.app.locals.refreshToken);
  delete req.app.locals.refreshToken;
  res.redirect(`${serverConfig.ContextPath}/`);
}));

// GET /auth/callback
router.get('/callback', asyncHandler(async (req, res, next) => {

  // Authorization Code Grant Type
  //
  if (req.query.code) {
    let tokens = await Cognito.getTokens(req.query.code);
    req.app.locals.accessToken = tokens.accessToken;
    req.app.locals.refreshToken = tokens.refreshToken;    
    res.redirect(`${serverConfig.ContextPath}/auth/setAccessTokenCookie`);
  }
  // Implict Code Grant Type
  //
  else {
    res.render('layout/defaultView', {
      meta_title: 'OAuth',
      body_content: 'oauth',
      contextPath: serverConfig.ContextPath
    });
  }
}));

// POST /auth/callback
// For Implict Grant
//
router.post('/callback', asyncHandler(async (req, res, next) => {
  let accessToken = Cognito.getAccessTokenCallback(req.body.data.token);
  if (!accessToken) { return res.status(400).json({ message: "oauth-failed-no-access-token-return" }); }
  Cognito.setCookie(res, "accessToken", accessToken);
  res.json({ success: true });
}));

module.exports = router;