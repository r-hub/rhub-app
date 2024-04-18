# The R-hub v2 web app

## How it works

The R-hub 2 web app is much simpler than the previous app, because
it does not need to queue or orchestrate the builds. It consists of
three services:

* `web`: the main web app, written in express.js.
* `db`: PostgreSQL database.
* `shell`: debug console.

### The web app

See `api.js` for the API. Some notes:

* Email validation sends a token to the supplied email address.
  The same email address may have multiple tokens.
* Job submission will create a repo at GH if needed, using the
  template at `r-hub2/template` and then triggers a workflow run. If the
  repo already exists (checked using our db, not the GH API), then a
  workflow is triggered immediately.
* Since GH creates workflow runs asynchronously, we don't know the exact
  id or URL of the workflow run that we created.
* The GH workflow downloads the submitted package from our web app,
  creates a new commit for it in the repository, and then starts
  jobs for running `R CMD check`, using the requested containers or
  runners.
* The app uses server side events to stream events to the client. This is
  currently only used for job submission, other API endpoints finish
  quickly, so they don't need this.
* We use Mailgun to send emails.

### The database

Very barebones currently, see `create.sql`.

### The debug console

Use `dokku enter rhub2-shell web` to enter the shell container.
Start R, and you have a bunch of `db$*` and `api$*` commands to query or
update the database directly, or to access the API. E.g.:
```
> db$query("SELECT * FROM builds")
...
```
## Local deployment using Docker Compose

```
docker compose build
docker compose up -d
```

To acccess the local app, use `http://localhost:3000` as the API URL.
Use `docker exec ...` to enter the shell container.

The database and the package uploads are on separate volumnes, so those
are kept between local deployments.

You can trigger GHA builds from a local deployment, but our action won't be
able to download the package in the GHA run from a `http://localhost`
address.

### Auto-reload

When deployed with `docke compose`, the `web` and the `shell` containers
auto-reload if their code changes. In `shell`, in R you need to run
`.reload()` to load the updated code.

## Deploying on dokku

There are two dokku apps in the repo, for the web app and for the shell.
To push the shell use
```
git remote add dokku-shell dokku@api.r-pkg.org:rhub2-shell
git push dokku-shell
```
and to push to the web app use
```
git remote add dokku dokku@api.r-pkg.org:rhub2
git push dokku
```

# License

MIT @ R Consortium
