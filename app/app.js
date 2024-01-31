import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import { Octokit, App } from 'octokit'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export var xapp = express();

const appId = process.env.APP_ID || "812047";
const privateKeyPath = process.env.PRIVATE_KEY_PATH ||
  "r-hub-2.2024-01-31.private-key.pem";
const privateKey = fs.readFileSync(privateKeyPath, 'utf8')

const ghapp = new App({
  appId,
  privateKey
});

// Optional: Get & log the authenticated app's name
const { data } = await ghapp.octokit.request('/app')

// Read more about custom logging: https://github.com/octokit/core.js#logging
ghapp.octokit.log.warn(`Authenticated as '${data.name}'`)

import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';

// view engine setup
xapp.set('views', path.join(__dirname, 'views'));
xapp.set('view engine', 'ejs');

xapp.use(logger('dev'));
xapp.use(express.json());
xapp.use(express.urlencoded({ extended: false }));
xapp.use(cookieParser());
xapp.use(express.static(path.join(__dirname, 'public')));

xapp.use('/', indexRouter);
xapp.use('/users', usersRouter);

// catch 404 and forward to error handler
xapp.use(function(req, res, next) {
  next(createError(404));
});

// error handler
xapp.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default xapp;
