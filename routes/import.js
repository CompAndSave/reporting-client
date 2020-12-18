var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');
const Cognito = require('aws-cognito-ops');
const resHandler = require('../services/resHandler');
const serverConfig = require('../server-config.json');
const AsyncApi = require('../classes/AsyncApi');
const axios = require('axios');
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

// GET /import/status
router.get('/status', asyncHandler(async (req, res, next) => {
  let accessToken = await Cognito.checkToken(req, res);
  if (!accessToken) { return res.redirect(`${serverConfig.ContextPath}/auth`); }

  let resData = {
    meta_title: "Import Data",
    body_content: 'import',
    waiting_status: true
  };

  AsyncApi.emitter.on("setDone", () => {
    res.render('layout/defaultView', { ...resData, contextPath: serverConfig.ContextPath });
  });
}));

// POST /import
router.post('/', asyncHandler(async (req, res, next) => {
  let accessToken = await Cognito.checkToken(req, res);
  if (!accessToken) { return await resHandler.handleRes(req, res, next, 401, { message: "not-authorized" }); }

  const apiUrl = REPORT_API_URL + 'import';
  let error, result = await axios({
    url: apiUrl,
    method: "post",
    data: {
      "site": "cas",
      "startTime": "2020-11-01",
      "mode": "full"
    },
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  }).catch(err => error = err);

  if (error) {
    console.log(error);
    return await resHandler.handleRes(req, res, next, 400, { message: error.message ? error.message : error });
  }

  let data = result.data;
  let messageId = data.match(/<MessageId>(.*)<\/MessageId>/)[1];

  // It won't be update globally until the router is run completely
  //
  AsyncApi.addRequest(messageId);

  console.log("async queue is added");
   
  await resHandler.handleRes(req, res, next, 200, { message: "success" });

  // let done = false;
  // AsyncApi.emitter.on("setDone", () => done = true);

  // let timestamp = new Date();
  // const TIMEOUT = 20000;  // set 20s timeout limit on response
  // do { await timer.timeout(2000); }
  // while (!done && (new Date() - timestamp) < TIMEOUT);

  // if (!done) { return await resHandler.handleRes(req, res, next, 408, { message: "request-timeout" }); }

  // await resHandler.handleRes(req, res, next, 200, { message: "success" });
}));

module.exports = router;