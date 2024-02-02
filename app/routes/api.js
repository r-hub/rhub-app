import express from 'express';
var router = express.Router();

import gh from '../lib/gh.js';
import pool from '../lib/pool.js';
import auth from '../lib/auth.js';

router.get('/-/repos', async function(req, res, next) {
  try {
    const user = await auth(req, res, { admin: true });
    var repos = await gh.request('GET /orgs/{org}/repos', {
      org: 'r-hub2'
    })
    res.send(repos);
  } catch (err) { next(err); }
});


router.put('/-/repo/:name', async function(req, res, next) {
  try {
    const user = await auth(req, res, { admin: true });
    // TODO
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
  } catch(err) { next(ero); }
});

router.post('/-/build', async function(req, res, next) {

});

export default router;
