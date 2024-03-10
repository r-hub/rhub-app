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

 function send_message(res, type, msg) {
  res.write(`timestamp: ${new Date().toISOString()}\n`);
  res.write(`event: ${type}\n`);
  res.write(`data: ${JSON.stringify(msg)}\n\n`);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

      const data = req.body;
      if (! data.config) {
        return res.set('Content-Type', 'application/json; charset=utf-8')
          .status(400)
          .send(JSON.stringify({
            "result": "error",
            "message": "Invalid data, no 'config' field"
          }));
      }

      // if client drops the connection, end it
      res.on('close', () => { res.end(); });

      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      // TODO: force configurable delay between submissions
      // Check if we have builds for this repo already
      const existsq = await pool.query(
        'SELECT EXISTS(SELECT id FROM builds WHERE repo_name = $1::text)',
        [ repo]
      );
      const exists = (existsq.rows.length) > 0 && existsq.rows[0].exists;
      send_message(res, "progress", "Creating job");
      await pool.query(
        'INSERT INTO builds \
        (email, submitted_at, repo_name, file_name, upload_path, status) \
        VALUES \
        ($1::text, $2::timestamp, $3::text, $4::text, $5::text, $6::text)',
        [
          user.email, now, repo, path, filename, 'created'
        ]
      );

      if (!exists) {
        const repo_url = 'https://github.com/r-hub2/' + repo;
        send_message(res, "progress", "Creating repository at " + repo_url);
        try {
          await ghapp.create_repo(repo);
        } catch(err) {
          send_message(res, "error", "Failed to create repository.");
          return res.end();
        }
        send_message(res, "progress", "Waiting 5s for repository")
        await delay(5000);
      }

      send_message(res, "progress", "Creating build");
//      const pkgurl = req.protocol + '://' + req.get('host') +
//        '/-/api/-/package/' + path.split(/[\\/]/).pop();
      const pkgurl = 'https://cran.r-project.org/src/contrib/tiff_0.1-12.tar.gz';
      const name = data.name || data.config;
      const id = data.id || '';
      try {
        await ghapp.start_workflow(repo, pkgurl, data.config, name, id);
      } catch(err) {
        send_message(
          res,
          "error",
          "Failed to start build job. Try again in a minute."
        );
        return res.end();
      }

      send_message(res, "result", "OK")
      res.end();

    } catch(err) {
      send_message(
        res,
        "error",
        "Internal R-hub error :(, please report an issue.\n" + err.toString()
      )
      res.end();
    }
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

// jobs -------------------------------------------------------------------
// admin: query job
router.get('/-/admin/build/:id', async function(req, res, next) {
  try {
    const user = await auth(req, res, { admin: true });
    // TODO
  } catch(err) { next(err); }
});

// repos ------------------------------------------------------------------
router.get("/-/admin/repo-exists/:name", async function(req, res, next) {
  try {
    const ret = await ghapp.repo_exists(req.params.name);
    res.send(ret);
  } catch (err) { next(err); }
});

router.get("/-/admin/repo-wait/:name", async function(req, res, next) {
  try {
    const ret = await ghapp.wait_for_repo(req.params.name);
    res.send(ret);
  } catch (err) { next(err); }
});

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
