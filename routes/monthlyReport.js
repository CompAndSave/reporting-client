const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Report = require('../classes/Report');

// GET /
router.get('/:year/:month?', asyncHandler(async (req, res, next) => {
  let accessToken = req.cookies.AWSCognition_accessToken;
  if (!accessToken) { return res.redirect("/auth"); }

  let resData = {}, data, tableData, reqBody= {}, error=false, groupBy;
  let quarters = ["Q1", "Q2", "Q3", "Q4"];
  let months = [ "January", "February", "March", "April", "May", "June", 
           "July", "August", "September", "October", "November", "December" ];   

  if(req.params.year){
    reqBody.year = parseInt(req.params.year);
  }

  if(req.params.month){
    reqBody.month = parseInt(req.params.month);
  }

  if(req.query.groupBy){
    groupBy = req.query.groupBy;
    reqBody.groupBy = groupBy;
    if(groupBy == 'segment'){
      reqBody.showVariate = req.query.showVariate? req.query.showVariate : 0;
    }
  }

  data = await Report.getCampaignData(reqBody).catch(err => {
    error=true;
    return err;
  });

  if(data) {
    if(error){
      resData = {
        meta_title: 'Script Error',
        body_content: 'error',
        error: data 
      }
    }
    
    tableData = data.result;

    if(tableData.length > 0) {
      if(groupBy == 'monthly'){
        tableData = data.result.map(function(el) {
          var column = Object.assign({}, el);
          column.name = months[el.month-1];
          return column;
        })
      }

      if(groupBy == 'quarterly'){
        tableData = data.result.map(function(el) {
          var column = Object.assign({}, el);
          column.name = el.year.toString() + ' ' + quarters[el.quarter-1];
          return column;
        })
      }

      if(groupBy == 'campaign'){
        tableData = data.result.map(function(el) {
          var column = Object.assign({}, el);
          column.name = months[el.month-1]+' Promo '+el.promo_num;
          return column;
        })
      }

      if(groupBy == 'segment') {
        tableData = data.result.map(function(el) {
          var column = Object.assign({}, el);
          column.name = months[el.month-1]+' Promo '+el.promo_num+' - '+segment.toUpperCase().replace(/_/g, ' ');
          return column;
        })
      }
    }
    resData = {
      meta_title: 'Campaign Report',
      body_content: 'campaign-data',
      data: (tableData.length > 0) ? JSON.stringify(tableData) : 0
    }
  } 
  res.render('layout/defaultView', resData);
}));

module.exports = router;