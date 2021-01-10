var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');
const Cognito = require('aws-cognito-ops');
const Report = require('../classes/Report');
const serverConfig = require('../server-config.json');

// GET /
router.get('/', asyncHandler(async (req, res, next) => {
  let accessToken = await Cognito.checkToken(req, res);
  if (!accessToken) { return res.redirect(`${serverConfig.ContextPath}/auth`); }

  let resData = {}, data="";

  let reqBody = { groupBy: "yearly" }

  data = await Report.getCampaignData(reqBody, accessToken).catch(err => {
    resData = {
      meta_title: 'Script Error',
      body_content: 'error',
      error: err 
    }
  });

  if(data) {
    resData = {
      meta_title: '',
      body_content: 'index',
      data: data.result
    }
  } 

  res.render('layout/defaultView', { ...resData, contextPath: serverConfig.ContextPath });
}));

module.exports = router;