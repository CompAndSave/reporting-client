var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');
const Report = require('../classes/Report');

// GET /
router.get('/', asyncHandler(async (req, res, next) => {

  let resData = {}, data="";

  let reqBody = { groupBy: "yearly" }

  data = await Report.getCampaignData(reqBody).catch(err => {
    resData = {
      meta_title: 'Script Error',
      body_content: 'error',
      error: err 
    }
  });

  if(data) {
    resData = {
      meta_title: 'Campaign Performance YTD',
      body_content: 'index',
      data: data.result[0]
    }
  } 
  res.render('layout/defaultView', resData);
}));

module.exports = router;