var createError = require('http-errors');
var express = require('express');
var exphbs = require('express-handlebars');
var hbsHelpers = require('./lib/hbs-helpers');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressWinston = require('express-winston');
const winston = require('winston');
const moment = require('moment-timezone');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env')});
require('./initialize');
const serverConfig = require('./server-config');

var indexRouter = require('./routes/index');
var annualReportRouter = require('./routes/annual');

var app = express();

const helmet = require('helmet');
app.use(helmet());


//Get Node Modules JS Files
app.get('/scripts/foundation.min.js', function(req, res) {
  res.sendFile(__dirname + '/node_modules/foundation-sites/dist/js/foundation.min.js');
});
app.get('/scripts/foundation.min.js.map', function(req, res) {
  res.sendFile(__dirname + '/node_modules/foundation-sites/dist/js/foundation.min.js.map');
});
app.get('/scripts/tabulator.min.js', function(req, res) {
  res.sendFile(__dirname + '/node_modules/tabulator-tables/dist/js/tabulator.min.js');
});

//Stylesheet processing with sass
require('sass');
var sassMiddleware = require('node-sass-middleware');
app.use(
  sassMiddleware({
    src: path.join(__dirname, 'scss'),
    dest: path.join(__dirname + '/public/style'),
    includePaths: [
      path.join(__dirname, 'node_modules/foundation-sites'),
      path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free'),
      path.join(__dirname, 'node_modules/tabulator-tables/src')
    ],
    prefix: '/style',
    debug: false,
    outputStyle: 'extended',
  })
);

// view engine setup
var hbs = exphbs.create({
  defaultLayout: "index",
  helpers: hbsHelpers,
  partialsDir: [
    path.join(__dirname, 'views/layout/'),
    path.join(__dirname, 'views/partials/'),
    path.join(__dirname, 'views/content/')
  ],
  extname: 'hbs'
});
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

// app.use(logger('dev'));
// log all requests to access.log
logger.token('date', ()=> { return moment().tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format(); });
logger.format('accessLogFormat', ':remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" :status :res[content-length]');
app.use(logger('accessLogFormat', {
  stream: fs.createWriteStream(path.join(__dirname, serverConfig.AccessLogPath), { flags: 'a' })
}));

// To fix the Error: request entity too large
// https://stackoverflow.com/questions/19917401/error-request-entity-too-large
// 
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/campaign-report', annualReportRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// log all express handler errors to files
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.File({ filename: path.join(__dirname, serverConfig.ExpressErrorLogPath), level: 'error' })
  ],
  format: winston.format.combine(
    winston.format.json()
  ),
  expressFormat: true,
  statusLevels: false,
  level: function (err, req, res, next) {
    var level = "";
    if (res.statusCode >= 100) { level = "info"; }
    if (res.statusCode >= 400) { level = "warn"; }
    if (res.statusCode >= 500 || typeof res.statusCode === 'undefined') { level = "error"; }
    // Ops is worried about hacking attempts so make Unauthorized and Forbidden critical
    // Cannot find a way to customize the levels for expressWinston
    if (res.statusCode == 401 || res.statusCode == 403) { level = "error"; }
    // No one should be using the old path, so always warn for those
    // if (req.path === "/v1" && level === "info") { level = "warn"; }
    return level;
  }
}));

// error handler
app.use(function(err, req, res, next) {
  console.log("enter default express error handler!");
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  let resData = {};

  // render the error page
  res.status(err.status || 500);
  if(err.status == 404) {
    resData.meta_title = '404 - Not Found';
    resData.body_content = '404';
  } else {
    resData.meta_title = 'Script Error';
    resData.body_content = 'error';
  }
  res.render('layout/defaultView', resData);
});

module.exports = app;
