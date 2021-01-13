const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
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

  let resData = {}, data, tableData, reqBody= {}, groupBy, year;
  let quarters = ["Q1", "Q2", "Q3", "Q4"];
  let months = [ "January", "February", "March", "April", "May", "June", 
           "July", "August", "September", "October", "November", "December" ];   

  if(req.params.year) {
    reqBody.year = year = Number(req.params.year);
  }
  if(req.params.quarter){
    reqBody.quarter = Number(req.params.quarter);
  }
  if (site) {
    reqBody.site = site;
  }

  groupBy = reqBody.groupBy = 'quarterly';

  data = await Report.getCampaignData(reqBody, accessToken).catch(err => {
    resData = {
      meta_title: 'Script Error',
      body_content: 'error',
      error: err 
    }
  });


  if(data) {
    tableData=data.result;
    for(let i=0; i< tableData.length; i++) {
      tableData[i].name = year + ' ' + quarters[i];
      let childData = await Report.getCampaignData({"year": year, "quarter": i+1, "groupBy": "monthly" }, accessToken).catch(err => {
        resData = {
          meta_title: 'Script Error',
          body_content: 'error',
          error: err 
        }
      });
      tableData[i].summaryData = childData.result;
    }
    let counter = 0;
    for(let i=0; i< tableData.length; i++) {
      for(let x=0; x<tableData[i].summaryData.length; x++){
        tableData[i].summaryData[x].name=months[counter];
        counter++;
      }
    } 
    resData = {
      meta_title: site ? `Quarterly Campaign Report for ${site.toUpperCase()}` : `Quarterly Campaign Report for all 3 sites`,
      body_content: 'campaign-data',
      data: (tableData.length > 0) ? JSON.stringify(tableData) : 0,
      tableId: groupBy+'ReportTable',
      tableType: 'tree'
    }
  } 
  res.render('layout/defaultView', { ...resData, contextPath: serverConfig.ContextPath });
}));

module.exports = router;