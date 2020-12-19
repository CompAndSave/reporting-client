var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');
const Cognito = require('aws-cognito-ops');
const resHandler = require('../services/resHandler');
const serverConfig = require('../server-config.json');
const AsyncApi = require('../classes/AsyncApi');
const axios = require('axios');
const { timer } = require('cas-common-lib');
const REPORT_API_URL = process.env.NODE_ENV === "production" ? process.env.REPORT_API_URL_PROD : process.env.REPORT_API_URL_STG;

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

  let done = false, ts = new Date(), wait = req.query.wait === "true" ? true : false;
  do {
    done = await AsyncApi.checkDone(req.params.id);
    if (done === null) { break; }
    if (!done) { await timer.timeout(serverConfig.CheckTimeRange); }
  } while (wait && !done && (new Date() - ts) < serverConfig.MaxTimeout);

  if (done) { await AsyncApi.removeRequest(req.params.id); }

  let status, message;
  switch (done) {
    case false:
      status = "pending";
      break;
    case null:
      status = "not found";
      break;
    default:
      message = JSON.parse(done);
      status = message.httpStatus == 200 ? "done" : "error";
  }

  res.render('layout/defaultView', { ...resData, contextPath: serverConfig.ContextPath, status: status, message: message && message.response ? JSON.stringify(message.response) : undefined });
}));

// POST /import
router.post('/', asyncHandler(async (req, res, next) => {
  let accessToken = await Cognito.checkToken(req, res);
  if (!accessToken) { return await resHandler.handleRes(req, res, next, 401, { message: "not-authorized" }); }

  let error;
  await AsyncApi.addRequest().catch(err => error = err);
  if (error) { return await resHandler.handleRes(req, res, next, 400, { message: error }, error); }

  const apiUrl = REPORT_API_URL + 'import';
  let result = await axios({
    url: apiUrl,
    method: "post",
    data: req.body.data,
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  let messageId = result.data.match(/<MessageId>(.*)<\/MessageId>/);
  if (!messageId) { return await resHandler.handleRes(req, res, next, 400, { message: "missing-<MessageId>-tag-at-response-message" }, result.data); }

  await AsyncApi.setRequest(messageId[1]);
  await resHandler.handleRes(req, res, next, 200, { id: messageId[1] });
}));

module.exports = router;