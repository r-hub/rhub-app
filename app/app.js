import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import createError from 'http-errors';
import { spawn } from "child_process";

async function cmd(command) {
  let p = spawn(command[0], command.slice(1));
  return new Promise((resolveFunc) => {
    p.on("exit", (code) => {
      resolveFunc(code);
    });
  });
}

import { CronJob } from 'cron';

const job = CronJob.from({
	cronTime: '0 16 * * *',
  onTick: async function() {
    console.log('Cleaning up /uploads');
    await cmd([
      'find', '/uploads/', '-type', 'f', '-mtime', '+1',
      '-exec', 'rm', '-f', '{}', ';'
    ]);
    console.log('Cleaned up old files in /uploads');
  },
	start: true, // start
	timeZone: 'Europe/Madrid'
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export var xapp = express();

import apiRouter from './routes/api.js';

// view engine setup
xapp.set('views', path.join(__dirname, 'views'));
xapp.set('view engine', 'ejs');

xapp.use(logger(
  ':remote-addr - :remote-user [:date[clf]] ' +
  '":method :url HTTP/:http-version" :status ' +
  ':res[content-length] ":referrer" ":user-agent" ' +
  ':response-time ms'
));
xapp.use(express.json());
xapp.use(express.urlencoded({ extended: false }));
xapp.use(cookieParser());
xapp.use(express.static(path.join(__dirname, 'public')));

// JSON API
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
