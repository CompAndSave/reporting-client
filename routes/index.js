var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');

// GET /
router.get('/', asyncHandler(async (req, res, next) => {
  res.render('layout/defaultView', {
    meta_title: 'Welcome',
    body_content: 'index'
  });
}));

module.exports = router;