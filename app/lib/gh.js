import { Octokit, App } from 'octokit'
import fs from 'fs';

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

  async create_repo(repo, options) {
    options = options || {};
    var oc = await this.octokit();
    var ret = await oc.request("POST /orgs/{org}/repos",  {
      org: 'r-hub2',
      name: repo,
      description: options.description || 'Created by R-hub',
      'private': false
    });
    return ret;
  }

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
}

var ghapp = new GHApp(appId, privateKey);

export default ghapp;
