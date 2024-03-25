# Deployment on AKS

We use [kompose](https://kompose.io/) to convert the Docker Compose
config file to a Kubernetes config that works with AKS. It needs a bit of
post-processing, which is in the `Makefile`. After modifying
`docker-compose.yaml`, always run `make k8s`.

## Credentials

Log in with `az`, and get the credentials for a `rhub2` AKS cluster:
```
az aks get-credentials -n rhub2 --resource-group r-hub
```

## Ingress controller

```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
```

## TLS

```
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.1/cert-manager.yaml
```

## Deploy app

Generate k8s yaml files, to update image versions and to
create/update the volumes with the secrets.

```
make k8s
kubectl apply -k k8s
```

## Configure DNS

Check IP address of the builder2 ingress and add it to your DNS.

When the letsencrypt pod picks up the hostname from the DNS, it'll
automatically configure HTTPS. The pod's name is something like
`cm-acme-http-solver-*`. Once it stopped running, HTTPS should be
configured. (Note that a local laptop might pick up the DNS
earlier or later, use `/etc/hosts` if the laptop is not picking
it up.)

## Secrets

The Mailgun API key must be in `r-hub-2-mailgun-key.txt` at the root
of the repo, and the private key of the GitHub App must be in
`r-hub-2.2024-03-11.private-key.pem`, at the same place.

`make k8s` will include them (base64 encoded, so essentially plain text)
in `k8s/mailguntoken-secret.yaml` and `k8s/ghappkey-secret.yaml`.
These files must not be included in the git repostory.

The database password is in `r-hub-2-postgress-pass.txt`.

## Database

The database is part of the deployment for local testing, but not
for the production system, because running PostgreSQL on Kubernetes is
quite complicated. So it is a PostgreSQL flexible server on Azure,
in the same virtual network as the Kubernetes cluster.

Create a database server:
```
az postgres flexible-server create --vnet aks-vnet-38300345 \
   --subnet aks-subnet-postgres --location westus3 \
   --resource-group MC_r-hub_rhub2_westus3
```

Then create the database and the user, using the default password.
This works from any shell that has access to the databse server,
e.g. using `psql` on the shell pod is also fine.

```
psql -U lethalgerbil5 -h server844543569.postgres.database.azure.com -d postgres
```

```
CREATE USER rhub2 NOCREATEDB PASSWORD '<pass>';
CREATE DATABASE rhub2;
GRANT ALL PRIVILEGES ON DATABASE rhub2 TO rhub2;
```

Check that you can connect to the new DB with the new user:

```
psql -U rhub2 -h server844543569.postgres.database.azure.com
```

Run the code from `create.sql`.

## Updates

1. Update and test the service locally.
2. Bump the version number of the updated image in `docker-compose.yml`.
3. `make build`
4. `make push`
5. `make k8s`
6. `kubectl get pods`, to make sure that the current `kubectl` context
   is the correct one.
7. `kubectl apply -k k8s`
8. `kubectl get pods` to make sure the update was successful.
