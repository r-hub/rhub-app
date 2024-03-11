
# Deployment on AKS

## Credentials

Log int with `az`, and get the credentials for a `rhub2` AKS cluster:
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
