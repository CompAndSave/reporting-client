var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');

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
  
  resData = {
    meta_title: 'Annual Campaign Report',
    body_content: 'campaign-data',
    req_body: JSON.stringify(reqBodyParser)
  }
  res.render('layout/defaultView', resData);
}));

module.exports = router;