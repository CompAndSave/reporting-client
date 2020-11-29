const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Report = require('../classes/Report');

// GET /
router.get('/:year?', asyncHandler(async (req, res, next) => {
  let resData = {}, data="", reqBodyParser= {};
  let year = req.params.year? req.params.year : '';

  
  if(year){
    reqBodyParser = {
      year: year,
      groupBy: "monthly"
    }
  } 
  
  data = await Report.getCampaignData(reqBodyParser);
  console.log(data);
  resData = {
    meta_title: 'Annual Campaign Report',
    body_content: 'campaign-data',
    data: JSON.stringify(data.result)
  }
  res.render('layout/defaultView', resData);
}));

module.exports = router;