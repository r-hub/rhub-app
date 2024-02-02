import express from 'express';
var router = express.Router();

import gh from '../lib/gh.js';
import pool from '../lib/pool.js';

router.get('/-/repos', async function(req, res, next) {
    var repos = await gh.request('GET /orgs/{org}/repos', {
        org: 'r-hub2'
    })
    res.send(repos);
})

router.get('/-/users', async function(req, res, next) {
    var users = await pool.query(
        'SELECT email, name, repo_prefix FROM users'
    );
    res.send(users.rows);
})

router.get('/-/build/:id', async function(req, res, next) {

})

export default router;
