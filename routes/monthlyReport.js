const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { algo } = require('cas-common-lib');
const Cognito = require('aws-cognito-ops');
const Report = require('../classes/Report');
const serverConfig = require('../server-config.json');

// GET /
router.get('/:year?', asyncHandler(async (req, res, next) => {
  let accessToken = await Cognito.checkToken(req, res);
  if (!accessToken) { return res.redirect(`${serverConfig.ContextPath}/auth`); }

  let site = req.query.site;

  // if site parameter is not a valid site key, set it to all 3 sites
  //
  if (typeof site !== "undefined" && ["cas", "ci", "ti"].filter(item => item === site).length === 0) { site = undefined; }

  let campaignData, error, tableData;
  let months = [ "January", "February", "March", "April", "May", "June", 
           "July", "August", "September", "October", "November", "December" ];   
  let monthsShort = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
           "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];   

  let year = Number(req.params.year);
  if (!Number.isInteger(year)) { return res.render('layout/defaultView', { meta_title: "Script Error", body_content: 'error', error: `invalid-year-param-${req.params.year}`}); }

  campaignData = Report.getCampaignData(site ? { site: site, year: year, groupBy: "campaign" } : { year: year, groupBy: "campaign" }, accessToken).catch(err => error = err);
  tableData = Report.getCampaignData(site ? { site: site, year: year, groupBy: "monthly" } : { year: year, groupBy: "monthly" }, accessToken).catch(err => error = err);
  [tableData, campaignData] = await Promise.all([tableData, campaignData]);
  if (error) { return res.render('layout/defaultView', { meta_title: "Script Error", body_content: 'error', error: error }); }

  tableData = algo.objectSort2Sync(tableData.result, { month: 1 });
  for (let i = 0; i < tableData.length; ++i) {
    tableData[i].name = months[tableData[i].month - 1];
    tableData[i].summaryData = algo.objectSort2Sync(campaignData.result.filter(data => data.month === tableData[i].month), { promo_num: 1 });
    for (let j = 0; j < tableData[i].summaryData.length; ++j) {
      tableData[i].summaryData[j].name = `${monthsShort[tableData[i].month - 1]}${tableData[i].summaryData[j].promo_num} Promo`;
    }
  }

  res.render('layout/defaultView', {
    meta_title: site ? `Monthly Campaign Report for ${site.toUpperCase()}` : `Monthly Campaign Report for all 3 sites`,
    body_content: 'campaign-data',
    contextPath: serverConfig.ContextPath,
    data: (tableData.length > 0) ? JSON.stringify(tableData) : 0,
    tableId: 'monthlyReportTable',
    tableType: 'tree',
  });
}));

module.exports = router;