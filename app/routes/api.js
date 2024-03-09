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

import { v4 as uuidv4 } from 'uuid';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

import pool from '../lib/pool.js';
import auth from '../lib/auth.js';
import ghapp from '../lib/gh.js';
import mail_token from '../lib/mail-token.js';

// public API =============================================================

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

      res.send("OK");
    } catch(err) { next(err); }
});

// admin API ==============================================================

// users ------------------------------------------------------------------
// create user, i.e. validate email
router.post('/-/user/validate', async function(req, res, next) {
  try {
    const data = req.body;
    // If there is no email
    if (! data.email ) {
      return res.set('Content-Type', 'application/json; charset=utf-8')
        .status(400)
        .send(JSON.stringify({
          "result": "error",
          "message": "Invalid data, no 'email' field"
        }));
    }

    const token = uuidv4();
    const repo_prefix = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: '-',
      length: 2
    }) + '-';

    await pool.query(
      'INSERT INTO tokens VALUES ($1::text, $2::text, $3::text)',
      [ data.email, token, 'validated']
    );

    await mail_token(data.email, token);

    // If there is no user yet for this email, then also add a user,
    // to have a repo prefix.
    await pool.query(
      'INSERT INTO users (email, repo_prefix, admin) \
       VALUES ($1::text, $2::text, false) \
       ON CONFLICT DO NOTHING',
       [data.email, repo_prefix]
    )

    res.send({ result: "ok" });

  } catch(err) { next(err); }
})

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
    // TODO
  } catch(err) { next(err); }
});

// repos ------------------------------------------------------------------
// list all GH repos
// TODO: pagination
router.get('/-/admin/repos', async function(req, res, next) {
  try {
    var repos = await ghapp.list_repos();
    res.send(repos.data);
  } catch (err) { next(err); }
});

// create GH repo
router.post('/-/admin/repo/:name', async function(req, res, next) {
  try {
    var ret = await ghapp.create_repo(req.params.name);
    res.send(ret);
  } catch(err) { next(err); }
})

// delete GH repo
router.delete('/-/admin/repo/:name', async function(req, res, next) {
  try {
    var ret = await ghapp.delete_repo(req.params.name);
    res.send(ret);
  } catch (err) { next(err); }
})

// get workflow file from repo
router.get('/-/admin/repo/:name/workflow', async function(req, res, next) {
try {
  var ret = await ghapp.get_contents(req.params.name, '.github/workflows/rhub-rc.yaml')
  res.send(ret);
} catch(err) { next(err); }
})

export default router;
