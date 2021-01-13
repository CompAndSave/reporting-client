var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');
const Cognito = require('aws-cognito-ops');
const ImportData = require('../classes/ImportData');
const resHandler = require('../services/resHandler');
const serverConfig = require('../server-config.json');

// GET /import
router.get('/', asyncHandler(async (req, res, next) => {
  let accessToken = await Cognito.checkToken(req, res);
  if (!accessToken) { return res.redirect(`${serverConfig.ContextPath}/auth`); }

  let resData = {
    meta_title: "Fetch Data",
    body_content: 'import',
    waiting_status: false,
    host_instance: true
  };

  res.render('layout/defaultView', { ...resData, contextPath: serverConfig.ContextPath });
}));

// POST /import
router.post('/', asyncHandler(async (req, res, next) => {

  // Set request timeout as 15 mins (Lambda max timeout is 15 mins)
  // The default timeout for nodejs is 2mins and it is not long enough for this request to be done
  // Browser will automatically make another request after timeout and it will cause the script run again asynchronously
  //
  req.setTimeout(900000);

  let accessToken = await Cognito.checkToken(req, res);
  if (!accessToken) { return await resHandler.handleRes(req, res, next, 401, { message: "not-authorized" }); }

  let error, result = await ImportData.hostedImport(req.body.data).catch(err => error = err);

  if (error) { await resHandler.handleRes(req, res, next, 400, { message: error.message ? error.message : error }, error); }
  else { await resHandler.handleRes(req, res, next, 200, result.data); }
}));

module.exports = router;