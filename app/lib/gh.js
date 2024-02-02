import { Octokit, App } from 'octokit'
import fs from 'fs';

const appId = process.env.APP_ID || "812047";
const installId = 46807577;
const privateKeyPath = process.env.PRIVATE_KEY_PATH ||
  "r-hub-2.2024-01-31.private-key.pem";
const privateKey = fs.readFileSync(privateKeyPath, 'utf8')

const ghapp = new App({
  appId,
  privateKey
});

// Optional: Get & log the authenticated app's name
const { data } = await ghapp.octokit.request('/app')
ghapp.octokit.log.warn(`Authenticated as '${data.name}'`)

const octokit = await ghapp.getInstallationOctokit(installId);

export default octokit;
