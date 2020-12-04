var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');
const Report = require('../classes/Report');

// GET /
router.get('/', asyncHandler(async (req, res, next) => {
  let accessToken = req.cookies.AWSCognition_accessToken;
  if (!accessToken) { return res.redirect("/auth"); }

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
      data: data.result[0]
    }
  } 
  res.render('layout/defaultView', resData);
}));

module.exports = router;