const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Report = require('../classes/Report');

// GET /
router.get('/:year?', asyncHandler(async (req, res, next) => {
  let accessToken = req.cookies.AWSCognition_accessToken;
  if (!accessToken) { return res.redirect("/auth"); }

  let resData = {}, data, tableData, reqBody= {}, groupBy;

  let months = [ "January", "February", "March", "April", "May", "June", 
           "July", "August", "September", "October", "November", "December" ];   
  let monthsShort = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
           "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];   

  if(req.params.year){
    reqBody.year = year = parseInt(req.params.year);
  }

  groupBy = reqBody.groupBy = 'monthly';

  data = await Report.getCampaignData(reqBody, accessToken).catch(err => {
    resData = {
      meta_title: 'Script Error',
      body_content: 'error',
      error: err 
    }
  });

  if(data) {

    tableData = data.result;
    for(let i=0; i< tableData.length; i++) {
      tableData[i].name = months[i];
      childData = await Report.getCampaignData({"year": year, "month": i+1, "groupBy": "campaign" }, accessToken).catch(err => {
        resData = {
          meta_title: 'Script Error',
          body_content: 'error',
          error: err 
        }
      });
      tableData[i].summaryData = childData.result;
    }

    for(let i=0; i<tableData.length; i++) {
      for(let x=0; x<tableData[i].summaryData.length; x++){
        tableData[i].summaryData[x].name = monthsShort[i]+(x+1)+' Promo';
      }
    } 

    resData = {
      meta_title: 'Monthly Campaign Report',
      body_content: 'campaign-data',
      data: (tableData.length > 0) ? JSON.stringify(tableData) : 0,
      tableId: groupBy+'ReportTable',
      tableType: 'tree'
    }
  } 
  res.render('layout/defaultView', resData);
}));

module.exports = router;