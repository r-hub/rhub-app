import { Octokit, App } from 'octokit'
import { createHash } from 'crypto';
import fs from 'fs';
import got from 'got';

const appId = process.env.APP_ID || "812047";
const installId = 46807577;
const privateKeyPath = process.env.PRIVATE_KEY_PATH ||
  "r-hub-2.2024-01-31.private-key.pem";
const privateKey = fs.readFileSync(privateKeyPath, 'utf8')

class GHApp {
  constructor(appId, privateKey) {
    this.appId = appId;
    this.privateKey = privateKey;
    this.app_ = null;
    this.octokit_ = null;
  }

  async octokit() {
    if (this.app_ === null) {
      this.app_ = new App({
        appId: this.appId,
        privateKey: this.privateKey
      });
    }
    if (this.octokit_ === null) {
      this.octokit_ = await this.app_.getInstallationOctokit(installId);
      const { data } = await this.octokit_.request('/app')
      this.octokit_.log.warn(`Authenticated as '${data.name}'`)
    }
    return this.octokit_
  }

  // we do not need to use the API for this one, well assuming that
  // the repos are public
  async repo_exists(repo) {
    const url = 'https://github.com/' + 'r-hub2/' + repo;
    try {
      const ret = await got.head(url);
      return true;
    } catch (err) {
      if (err.response.statusCode === 404) {
        return false;
      } else {
        throw err;
      }
    }
  }

  async create_repo(repo, options) {
    options = options || {};
    var oc = await this.octokit();
    try {
      const ret = await oc.request(
        'POST /repos/{template_owner}/{template_repo}/generate', {
          template_owner: 'r-hub2',
          template_repo: 'template',
          owner: 'r-hub2',
          name: repo,
          description: options.description || 'Created by R-hub',
          include_all_branches: false,
          'private': false,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        }
      )
      return({ new: true, response: ret })
    } catch (error) {
      // Maybe it already exists.
      if (error.response.status == 422 &&
         !! error.response.data.message.match(/already exists/)) {
          return({ new: false, response: error.response })
      } else {
        throw error;
      }
    }
  }

  async start_workflow(repo, url, config, name, id) {
    var oc = await this.octokit();
    var ret = await oc.request(
      'POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
        owner: 'r-hub2',
        repo: repo,
        workflow_id: 'rhub-rc.yaml',
        ref: 'main',
        inputs: {
          url: url,
          config: config,
          name: name,
          id: id
        },
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    )
  }

  // TODO: paginate
  async list_repos() {
    var oc = await this.octokit();
    var repos = await oc.request('GET /orgs/{org}/repos', {
      org: 'r-hub2'
    })
    return repos;
  }

  async delete_repo(repo) {
    var oc = await this.octokit();
    var ret = await oc.request('DELETE /repos/{owner}/{repo}', {
      owner: 'r-hub2',
      repo: repo
    })
    return ret;
  }

  async get_contents(repo, path) {
    var oc = await this.octokit();
    var ret = await oc.request(
      'GET /repos/{owner}/{repo}/contents/{path}', {
        owner: 'r-hub2',
        repo: repo,
        path: path,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    )
    const cnt = atob(ret.data.content);
    const sha = createHash('sha256').update(cnt).digest('hex');
    return { workflow: cnt, sha256: sha, response: ret };
  }

  async wait_for_repo(repo) {
    const url = 'https://raw.githubusercontent.com/r-hub2/' +
      repo + '/main/.github/workflows/rhub-rc.yaml';
    await got.head(url, { retry: {
      limit: 10,
      statusCodes: [ 404 ],
      calculateDelay: ({computedValue}) => {
        console.log("witing " + computedValue);
        return computedValue;
      }

    }});
    return true;
  }
}

var ghapp = new GHApp(appId, privateKey);

export default ghapp;
