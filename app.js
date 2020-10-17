const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const indexRouter = require('./routes/index');
const helloRouter = require('./routes/hello');

const app = express();
// set up user session
app.use(session({
    secret: 'secretposenet',
    resave: false,
    saveUninitialized: false
  }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'secretposenet',
    resave: true,
    saveUninitialized: true,
  }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/hello', helloRouter);

module.exports = app;
