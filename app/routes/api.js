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

import ghapp from '../lib/gh.js';
import pool from '../lib/pool.js';
import auth from '../lib/auth.js';
import git from '../lib/git.js';

// public API =============================================================

// create job
router.post(
  '/-/job/:package',
  upload.single('package'),
  async function(req, res, next) {
    try {
      const user = await auth(req, res, { admin: false });
      const repo = user.repo_prefix + req.params.package;
      // TODO: force configurable delay
      await pool.query(
        'INSERT INTO builds \
        (email, submitted_at, repo_name, file_name, upload_path, status) \
        VALUES \
        ($1::text, $2::timestamp, $3::text, $4::text, $5::text, $6::text)',
        [
          user.email, new Date(new Date().toISOString()), repo,
          req.file.path, req.file.originalname, 'created'
        ]
      );
      res.send("OK");
    } catch(err) { next(err); }
});

// admin API ==============================================================

// repos ------------------------------------------------------------------
// list all GH repos
// TODO: pagination
router.get('/-/admin/repos', async function(req, res, next) {
  try {
    const user = await auth(req, res, { admin: true });
    var repos = await ghapp.list_repos();
    res.send(repos.data);
  } catch (err) { next(err); }
});

// create GH repo
router.post('/-/admin/repo/:name', async function(req, res, next) {
  try {
    const user = await auth(req, res, { admin: true });
    var ret = await ghapp.create_repo(req.params.name);
    res.send(ret);
  } catch (err) { next(err); }
})

// delete GH repo
router.delete('/-/admin/repo/:name', async function(req, res, next) {
  try {
    const user = await auth(req, res, { admin: true });
    var ret = await ghapp.delete_repo(req.params.name);
    res.send(ret);
  } catch (err) { next(err); }
})

// clone GH repo
router.get('/-/admin/repo/clone/:name', async function(req, res, next) {
  try {
    const user = await auth(req, res, { admin: true });
    var ret = await git.clone_repo(req.params.name);
    res.send(ret)
  } catch (err) { next(err); }
})

// clean cloned GH repo
router.get('/-/admin/repo/clean/:name', async function(req, res, next) {
  try {
    const user = await auth(req, res, { admin: true });
    var ret = await git.clean_repo(req.params.name);
    res.send(ret);
  } catch(err) { next(err); }
})

// check if cloned repo exists
router.get('/-/admin/repo/check/:name', async function(req, res, next) {
  try {
    const user = await auth(req, res, {admin: true });
    var ret = await git.repo_exists(req.params.name);
    res.send(ret);
  } catch(err) { next(err); }
})

// remove a cloned repo
router.get('/-/admin/repo/prune-clone/:name', async function(req, res, next) {
  try {
    const user = await auth(req, res, {admin: true });
    var ret = await git.prune_clone(req.params.name);
    res.send(ret);
  } catch(err) { next(err); }
})

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
