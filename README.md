# The R-hub v2 web app

## How it works

The R-hub 2 web app is much simpler than the previous app, because
it does not need to queue or orchestrate the builds. It consists of three
services:

* `web`: the main web app, written in express.js.
* `db`: PostgreSQL database.
* `shell`: debug console.

### The web app

See `api.js` for the API. Some notes:

* Email validation just sends a token to the supplied email address.
  The same email address may have multiple tokens.
* Job submission will create a repo at GH if needed, using the
  template at `r-hub2/template` and then triggers a workflow run. If the
  repo already exists (checked using our db, not the GH API), then a
  workfloe is triggered immediately.
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

Use `docker exec` to get to the debug console, or
```
kubectl get pods
kubectl exec --stdin --tty shell-<id>  -- /bin/bash
```
to do the same for the deployed app. Start R, and you have a bunch of
`db$*` and `api$*` commands to query or update the database directly,
or to access the API.

## Secrets

The Mailgun API key must be in `r-hub-2-mailgun-key.txt` at the root
of the repo, and the private key of the GitHub App must be in
`r-hub-2.2024-03-11.private-key.pem`, at the same place.

## Local deployment using Docker Compose

The `Makefile` can deploy the app locally. It uses `docker stack`, so
it will work out of the box with Docker Dsektop.

To acccess the local app, use `http://localhost:3000` as the API URL.
You can also use the debug console, i.e. the `shell` service.

### Docker platforms, `linux/amd64` vs `linux/arm64`

`docker stack` does not know about Docker platforms, so the
`Makefile` creates a new compose config file,
`docker-compose-local.yml`, that uses `linux/arm64`on arm64 platforms.
The published images must be `linux/amd64`, because that's what
the deployment uses.

Always use `make build` and `make push` to build and push the images,
and `make dev` to deploy them locally.

### Auto-reload

When deployed with `make dev`, the `web` and the `shell` containers
auto-reload if their code changes. In `shell`, in R you need to run
`.reload()` to load the updated code.

## Deploying on AKS

See [k8s/README.md](k8s/README.md).

# License

MIT @ R Consortium
