import sgit from 'simple-git';
import fs from 'node:fs/promises';

const token = process.env.GITHUB_TOKEN;

class RHubGit {
  constructor() {
    this.url = 'https://github.com/r-hub2/'
    this.repos = '/repos/'
  }

  async clone_repo(repo) {
    const res = await sgit().clone(this.url + repo, this.repos + repo);
    return res;
  }

  async clean_repo(repo) {
    const wd = this.repos + repo;
    const res1 = await sgit(wd).clean("ffdx");
    const res2 = await sgit(wd).reset("hard");
    return res2;
  }

  async repo_exists(repo) {
    const wd = this.repos + repo;
    try {
        await fs.access(wd);
        return true;
    } catch(err) {
        return false;
    }
  }

  async prune_clone(repo) {
    const wd = this.repos + repo;
    await fs.rm(wd, { recursive: true, force: true });
    return true;
  }

  async ensure_repo(repo) {
    const ex = await this.repo_exists(repo);
    if (!ex) {
        await this.clone_repo(repo);
    } else {
        await this.clean_repo(repo);
    }
  }
}

var git = new RHubGit();

export default git;
