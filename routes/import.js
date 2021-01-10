var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');
const Cognito = require('aws-cognito-ops');
const resHandler = require('../services/resHandler');
const serverConfig = require('../server-config.json');
const axios = require('axios');
const REPORT_API_URL = process.env.REPORT_API_URL_SANDBOX;

// GET /import
router.get('/', asyncHandler(async (req, res, next) => {
  let accessToken = await Cognito.checkToken(req, res);
  if (!accessToken) { return res.redirect(`${serverConfig.ContextPath}/auth`); }

  let resData = {
    meta_title: "Import Data",
    body_content: 'import',
    waiting_status: false,
    host_instance: true
  };

  res.render('layout/defaultView', { ...resData, contextPath: serverConfig.ContextPath });
}));

// POST /import
router.post('/', asyncHandler(async (req, res, next) => {
  let accessToken = await Cognito.checkToken(req, res);
  if (!accessToken) { return await resHandler.handleRes(req, res, next, 401, { message: "not-authorized" }); }

  let error, result = await axios({
    url: REPORT_API_URL + 'import',
    method: "post",
    data: req.body.data
  }).catch(err => error = err);

  if (error) { await resHandler.handleRes(req, res, next, 400, { message: error.message ? error.message : error }, error); }
  else { await resHandler.handleRes(req, res, next, 200, result.data); }
}));

module.exports = router;