import express from 'express';
var router = express.Router();

import amqplib from 'amqplib';
const broker_url = 'amqp://queue';

import ghapp from '../lib/gh.js';
import git from '../lib/git.js';

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
    } catch (err) { next(err); }
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

// clone GH repo
router.get('/-/admin/clone/create/:name', async function(req, res, next) {
    try {
      var ret = await git.clone_repo(req.params.name);
      res.send({ output: ret })
    } catch (err) { next(err); }
})

// clean cloned GH repo
router.get('/-/admin/clone/clean/:name', async function(req, res, next) {
    try {
      var ret = await git.clean_repo(req.params.name);
      res.send({ output: ret });
    } catch(err) { next(err); }
})

// check if cloned repo exists
router.get('/-/admin/clone/check/:name', async function(req, res, next) {
    try {
      var ret = await git.repo_exists(req.params.name);
      res.send(ret);
    } catch(err) { next(err); }
})

// ensure that the cloned repo exists
router.get('/-/admin/clone/ensure/:name', async function(req, res, next) {
  try {
    var ret = await git.ensure_repo(req.params.name);
    res.send({ output: ret });
  } catch(err) { next(err); }
})

// remove a cloned repo
router.get('/-/admin/clone/prune/:name', async function(req, res, next) {
    try {
      var ret = await git.prune_clone(req.params.name);
      res.send({ output: ret });
    } catch(err) { next(err); }
})

export default router;
