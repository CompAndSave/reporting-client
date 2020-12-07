const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { algo } = require('cas-common-lib');
const Report = require('../classes/Report');

// GET /
router.get('/:year?', asyncHandler(async (req, res, next) => {
  let accessToken = req.cookies.AWSCognition_accessToken;
  if (!accessToken) { return res.redirect("/auth"); }

  let campaignData, error, tableData;
  let months = [ "January", "February", "March", "April", "May", "June", 
           "July", "August", "September", "October", "November", "December" ];   
  let monthsShort = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
           "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];   

  let year = Number(req.params.year);
  if (!Number.isInteger(year)) { return res.render('layout/defaultView', { meta_title: "Script Error", body_content: 'error', error: `invalid-year-param-${req.params.year}`}); }

  campaignData = Report.getCampaignData({ year: year, groupBy: "campaign" }, accessToken).catch(err => error = err);
  tableData = Report.getCampaignData({ year: year, groupBy: "monthly" }, accessToken).catch(err => error = err);
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

  // for (let i = 0; i < data.length, ++i) {
    
  // }

  // if(req.params.year){
  //   reqBody.year = year = parseInt(req.params.year);
  // }

  // groupBy = reqBody.groupBy = 'monthly';

  // data = await Report.getCampaignData(reqBody, accessToken).catch(err => {
  //   resData = {
  //     meta_title: 'Script Error',
  //     body_content: 'error',
  //     error: err 
  //   }
  // });

  // if(data) {

  //   tableData = data.result;
  //   for(let i=0; i< tableData.length; i++) {
  //     tableData[i].name = months[i];
  //     childData = await Report.getCampaignData({"year": year, "month": i+1, "groupBy": "campaign" }, accessToken).catch(err => {
  //       resData = {
  //         meta_title: 'Script Error',
  //         body_content: 'error',
  //         error: err 
  //       }
  //     });
  //     tableData[i].summaryData = childData.result;
  //   }

  //   for(let i=0; i<tableData.length; i++) {
  //     for(let x=0; x<tableData[i].summaryData.length; x++){
  //       tableData[i].summaryData[x].name = monthsShort[i]+(x+1)+' Promo';
  //     }
  //   } 

    // resData = {
    //   meta_title: 'Monthly Campaign Report',
    //   body_content: 'campaign-data',
    //   data: (tableData.length > 0) ? JSON.stringify(tableData) : 0,
    //   tableId: groupBy+'ReportTable',
    //   tableType: 'tree'
    // }
  // }

  res.render('layout/defaultView', {
    meta_title: 'Monthly Campaign Report',
    body_content: 'campaign-data',
    data: (tableData.length > 0) ? JSON.stringify(tableData) : 0,
    tableId: 'monthlyReportTable',
    tableType: 'tree'
  });
}));

module.exports = router;