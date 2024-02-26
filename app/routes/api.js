import express from 'express';
var router = express.Router();

import multer from 'multer';
const upload = multer({
  dest: '/uploads/',
  limits: {
    fields: 100,
    fieldSize: 100 * 1024,
    fileSize: 5 * 1024 * 1024,
    files: 1,
    parts: 101
  }
});

import amqplib from 'amqplib';

import pool from '../lib/pool.js';
import auth from '../lib/auth.js';

// public API =============================================================

const broker_url = 'amqp://queue';

// create job
router.post(
  '/-/job/:package',
  upload.single('package'),
  async function(req, res, next) {
    try {
      const user = await auth(req, res, { admin: false });
      const repo = user.repo_prefix + req.params.package;
      const now = new Date(new Date().toISOString());
      const path = req.file.path;
      const filename = req.file.originalname;

      // TODO: force configurable delay between submissions
      await pool.query(
        'INSERT INTO builds \
        (email, submitted_at, repo_name, file_name, upload_path, status) \
        VALUES \
        ($1::text, $2::timestamp, $3::text, $4::text, $5::text, $6::text)',
        [
          user.email, now, repo, path, filename, 'created'
        ]
      );

      var conn = await amqplib.connect(broker_url);
      var channel = await conn.createChannel();
      channel.assertQueue('job');

      const job = {
        email: user.email,
        time: now,
        repo: repo,
        path: path,
        filename: filename
      };

      await channel.sendToQueue('job', Buffer.from(JSON.stringify(job)));

      res.send("OK");
    } catch(err) { next(err); }
});

// admin API ==============================================================

// users ------------------------------------------------------------------
// admin: list all users
// TODO: pagination
router.get('/-/admin/users', async function(req, res, next) {
  try {
    const user = await auth(req, res, { admin: true });
    var users = await pool.query(
        'SELECT email, name, repo_prefix, admin FROM users'
    );
    res.send(users.rows);
  } catch(err) { next(err); }
});

// admin: create user
router.post('/-/admin/user/:email', async function(req, res, next) {
  try {
    const user = await auth(req, res, { admin: true });
    // TODO
  } catch(err) { next(err); }
})

// jobs -------------------------------------------------------------------
// admin: query job
router.get('/-/admin/build/:id', async function(req, res, next) {
  try {
    const user = await auth(req, res, { admin: true });

  } catch(err) { next(err); }
});

export default router;
