const serverless = require('serverless-http');
var createError = require('http-errors');
var express = require('express');
var exphbs = require('express-handlebars');
var hbsHelpers = require('./lib/hbs-helpers');
var path = require('path');
var cookieParser = require('cookie-parser');
require('./initialize-serverless');
const serverConfig = require('./server-config.json');
const asyncApi = require('./services/asyncApi');

var indexRouter = require('./routes/index');
var annualSummaryReportRouter = require('./routes/yearlyReport');
var quarterlySummaryReportRouter = require('./routes/quarterlyReport');
var monthlySummaryReportRouter = require('./routes/monthlyReport');
var campaignSummaryReportRouter = require('./routes/campaignReport');
var authRouter = require('./routes/auth');
var importRouter = require('./routes/import-serverless');

var app = express();

const helmet = require('helmet');
app.use(helmet());


//Get Node Modules JS Files
app.get(`${serverConfig.ContextPath}/scripts/foundation.min.js`, function(req, res) {
  res.sendFile(__dirname + '/node_modules/foundation-sites/dist/js/foundation.min.js');
});
app.get(`${serverConfig.ContextPath}/scripts/foundation.min.js.map`, function(req, res) {
  res.sendFile(__dirname + '/node_modules/foundation-sites/dist/js/foundation.min.js.map');
});
app.get(`${serverConfig.ContextPath}/scripts/tabulator.min.js`, function(req, res) {
  res.sendFile(__dirname + '/node_modules/tabulator-tables/dist/js/tabulator.min.js');
});

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

// To fix the Error: request entity too large
// https://stackoverflow.com/questions/19917401/error-request-entity-too-large
// 
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));

app.use(cookieParser());
app.use(serverConfig.ContextPath, express.static(path.join(__dirname, 'public')));

app.use(`${serverConfig.ContextPath}/`, indexRouter);
app.use(`${serverConfig.ContextPath}/yearly-report`, annualSummaryReportRouter);
app.use(`${serverConfig.ContextPath}/quarterly-report`, quarterlySummaryReportRouter);
app.use(`${serverConfig.ContextPath}/monthly-report`, monthlySummaryReportRouter);
app.use(`${serverConfig.ContextPath}/campaign-report`, campaignSummaryReportRouter);
app.use(`${serverConfig.ContextPath}/auth`, authRouter);
app.use(`${serverConfig.ContextPath}/import`, importRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  console.log(err);
  
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_DEV === 'development' ? err : {};

  let resData = { contextPath: serverConfig.ContextPath };

  // render the error page
  res.status(err.status || 500);
  if(err.status == 404) {
    resData.meta_title = '';
    resData.body_content = '404';
  } else {
    resData.meta_title = 'Script Error';
    resData.body_content = 'error';
  }
  res.render('layout/defaultView', resData);
});

const handler = serverless(app);
module.exports.handler = async (event, context) => {

  // if SNS event, route to SNS worker
  if (event.Records) {
    console.log(JSON.stringify(event.Records));

    let error;
    await asyncApi.worker(event.Records[0].Sns.Message).catch(err => error = err);
    if (error) { console.log(error); }
  }
  // if not SQS event, route to ExpressJS
  else {
    const result = await handler(event, context);
    return result;
  }
};