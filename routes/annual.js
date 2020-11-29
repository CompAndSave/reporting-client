var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');

// GET /
router.get('/:year?', asyncHandler(async (req, res, next) => {
  let resData = {}, data="";
  if(req.params.year == '2020'){
    const fs = require('fs');
    let rawdata = fs.readFileSync('./dummy/year2020.json');
    data = JSON.parse(rawdata);
  }
  resData = {
    meta_title: 'Annual Campaign Report',
    body_content: 'campaign-data',
    data: JSON.stringify(data)
  }
  res.render('layout/defaultView', resData);
}));

module.exports = router;