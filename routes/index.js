var express = require('express');
var router = express.Router();
const asyncHandler = require('express-async-handler');

// GET /
router.get('/', asyncHandler(async (req, res, next) => {
  res.render('index', {
    meta_title: "Index Page",
    body: "Hello World!"
  });
}));

module.exports = router;