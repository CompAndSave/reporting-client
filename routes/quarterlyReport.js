const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Report = require('../classes/Report');

// GET /
router.get('/:year?', asyncHandler(async (req, res, next) => {
  let accessToken = req.cookies.AWSCognition_accessToken;
  if (!accessToken) { return res.redirect("/auth"); }

  let resData = {}, data, tableData, reqBody= {}, groupBy;
  let quarters = ["Q1", "Q2", "Q3", "Q4"];
  let months = [ "January", "February", "March", "April", "May", "June", 
           "July", "August", "September", "October", "November", "December" ];   

  if(req.params.year){
    reqBody.year = year = parseInt(req.params.year);
  }
  if(req.params.quarter){
    reqBody.quarter = parseInt(req.params.quarter);
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
      childData = await Report.getCampaignData({"year": year, "quarter": i+1, "groupBy": "monthly" }, accessToken).catch(err => {
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
      meta_title: 'Quarterly Campaign Report',
      body_content: 'campaign-data',
      data: (tableData.length > 0) ? JSON.stringify(tableData) : 0,
      tableId: groupBy+'ReportTable',
      tableType: 'tree'
    }
  } 
  res.render('layout/defaultView', resData);
}));

module.exports = router;