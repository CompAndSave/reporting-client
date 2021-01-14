var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');
const Cognito = require('aws-cognito-ops');
const resHandler = require('../services/resHandler');
const serverConfig = require('../server-config.json');
const ImportData = require('../classes/ImportData');

// GET /import
router.get('/', asyncHandler(async (req, res, next) => {
  let accessToken = await Cognito.checkToken(req, res);
  if (!accessToken) { return res.redirect(`${serverConfig.ContextPath}/auth`); }

  let resData = {
    meta_title: "Import Data",
    body_content: 'import',
    waiting_status: false
  };

  res.render('layout/defaultView', { ...resData, contextPath: serverConfig.ContextPath });
}));

// GET /import/status/:id
// @query: wait (boolean)
//   If true, wait for the async api call done, default is false
//
router.get('/status/:id', asyncHandler(async (req, res, next) => {
  let accessToken = await Cognito.checkToken(req, res);
  if (!accessToken) { return res.redirect(`${serverConfig.ContextPath}/auth`); }

  let resData = {
    meta_title: "Import Data",
    body_content: 'import',
    waiting_status: true
  };

  let result = await ImportData.getStatus(req.params.id, req.query.wait === "true" ? true : false, serverConfig.CheckTimeRange, serverConfig.MaxTimeout);

  res.render('layout/defaultView', { ...resData, contextPath: serverConfig.ContextPath, status: result.status, message: result.message });
}));

// POST /import
router.post('/', asyncHandler(async (req, res, next) => {
  let accessToken = await Cognito.checkToken(req, res);
  if (!accessToken) { return await resHandler.handleRes(req, res, next, 401, { message: "not-authorized" }); }

  let error, result = await ImportData.serverlessImport(req.body.data, accessToken).catch(err => error = err);
  
  if (typeof error !== "undefined" && error.message === "missing-<MessageId>-tag-at-response-message") { return await resHandler.handleRes(req, res, next, 400, { message: error.message }, error.stack); }
  else if (typeof error !== "undefined") { return await resHandler.handleRes(req, res, next, 400, { message: error.message ? error.message : error }, error); }

  await resHandler.handleRes(req, res, next, 200, { id: result });
}));

module.exports = router;