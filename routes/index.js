var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');
const Cognito = require('aws-cognito-ops');
const { algo } = require('cas-common-lib');
const Report = require('../classes/Report');
const serverConfig = require('../server-config.json');

// GET /
router.get('/', asyncHandler(async (req, res, next) => {
  let accessToken = await Cognito.checkToken(req, res);
  if (!accessToken) { return res.redirect(`${serverConfig.ContextPath}/auth`); }

  let site = req.query.site;
  
  // if site parameter is not a valid site key, set it to all 3 sites
  //
  if (typeof site !== "undefined" && ["cas", "ci", "ti"].filter(item => item === site).length === 0) { site = undefined; }

  let resData, data = await Report.getCampaignData(site ? { site: site, groupBy: "yearly" } : { groupBy: "yearly" }, accessToken).catch(err => {
    resData = {
      meta_title: 'Script Error',
      body_content: 'error',
      error: err 
    }
  });

  if (typeof resData === "undefined") {
    resData = {
      meta_title: site ? `${site.toUpperCase()} Data` : "All 3 sites Data",
      body_content: 'index',
      data: algo.objectSort2Sync(data.result, { year: -1 }),
    }
  }

  res.render('layout/defaultView', { ...resData, contextPath: serverConfig.ContextPath });
}));

module.exports = router;