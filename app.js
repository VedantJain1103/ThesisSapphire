const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require("mongoose")

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');

var fs = require('fs');
require('dotenv/config');
require('dotenv').config()

// require("halfmoon/css/halfmoon-variables.min.css");
// Import JS library
// const halfmoon = require("halfmoon");

const hbs = require('hbs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var accountsRouter = require('./routes/accounts');
var adminRouter = require('./routes/admin');
var scholarRouter = require('./routes/scholar');
var mentorRouter = require('./routes/mentor');
var hodRouter = require('./routes/hod');
var deanRouter = require('./routes/dean');
var directorRouter = require('./routes/director');
var reviewerRouter = require('./routes/reviewer');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');
hbs.registerPartials(__dirname + '/views/modals');
hbs.registerPartials(__dirname + '/views/sideBars');
hbs.registerHelper('if_eq', function (a, b, opts) {
  if (a == b) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
})
hbs.registerHelper('if_neq', function (a, b, opts) {
  if (a != b) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
})

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {
  res.append('Access-Control-Allow-Origin', '*');
  res.append('Access-Control-Allow-Methods', 'GET, POST');
  res.append('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  next();
});



app.use('/', indexRouter);
app.use('/accounts', accountsRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/mentor', mentorRouter);
app.use('/hod', hodRouter);
app.use('/dean', deanRouter);
app.use('/director', directorRouter);
app.use('/scholar', scholarRouter);
app.use('/reviewer', reviewerRouter);

//Database connection
// const uri = process.env.MONGODB_URI;
// async function main() {
//   const client = new MongoClient(uri,{ useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//   try {
//     await client.connect();

//     console.log("MongoDB connected..........");
//   } catch (e) {
//     console.error(e);
//   } finally {
//     await client.close();
//   }
// }
// main().catch(console.error);

console.log("Server Started ....");
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
