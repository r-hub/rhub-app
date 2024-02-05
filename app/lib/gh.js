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
}

var ghapp = new GHApp(appId, privateKey);

export default ghapp;
