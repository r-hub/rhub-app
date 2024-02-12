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

router.get('/-/repos', async function(req, res, next) {
  try {
    const user = await auth(req, res, { admin: true });
    var repos = await ghapp.list_repos();
    res.send(repos.data);
  } catch (err) { next(err); }
});

router.post('/-/repo/:name', async function(req, res, next) {
  try {
    const user = await auth(req, res, { admin: true });
    var ret = await ghapp.create_repo(req.params.name);
    res.send(ret);
  } catch (err) { next(err); }
})

router.delete('/-/repo/:name', async function(req, res, next) {
  try {
    const user = await auth(req, res, { admin: true });
    var ret = await ghapp.delete_repo(req.params.name);
    res.send(ret);
  } catch (err) { next(err); }
})

// admin: list users
router.get('/-/users', async function(req, res, next) {
  try {
    const user = await auth(req, res, { admin: true });
    var users = await pool.query(
        'SELECT email, name, repo_prefix, admin FROM users'
    );
    res.send(users.rows);
  } catch(err) { next(err); }
});

// admin: query job
router.get('/-/build/:id', async function(req, res, next) {
  try {
    const user = await auth(req, res, { admin: true });
    // TODO
  } catch(err) { next(err); }
});

// admin: create user
router.post('/-/user/:email', async function(req, res, next) {
  try {
    const user = await auth(req, res, { admin: true });
    // TODO
  } catch(err) { next(err); }
})

// create job
router.post(
  '/-/job/:package',
  upload.single('package'),
  async function(req, res, next) {
    try {
      const user = await auth(req, res, { admin: false });
      console.log(user);
      console.log("upload");
      console.log(req.body.key1);
      console.log(req.file);
      res.send("OK");
    } catch(err) { next(err); }
});

export default router;
