import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import createError from 'http-errors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export var xapp = express();

import apiRouter from './routes/api.js';

// view engine setup
xapp.set('views', path.join(__dirname, 'views'));
xapp.set('view engine', 'ejs');

xapp.use(logger('dev'));
xapp.use(express.json());
xapp.use(express.urlencoded({ extended: false }));
xapp.use(cookieParser());
xapp.use(express.static(path.join(__dirname, 'public')));

xapp.use('/api', apiRouter);

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
