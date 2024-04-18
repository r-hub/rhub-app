# 2024-04

## Move to api.r-pkg.org

Get the tokens from old Redis:

```
echo 'keys *' | redis-cli  | cut -f2  > keys
cat keys | sort > keys.sorted
cp keys.sorted keys.clean
emacs keys.clean
# clean manuall to remove the keys we do not want to copy
cat keys.clean | sed 's/^/get "/' | sed 's/$/"/' | redis-cli  > vals.clean
```

Create postgres DB, app

```
dokku postgres:create rhub2
dokku apps:create rhub2
dokku postgres:link rhub2 rhub2
dokku builder-dockerfile:set rhub2 dockerfile-path app/Dockerfile
dokku apps:create rhub2-shell
dokku builder-dockerfile:set rhub2-shell dockerfile-path shell/Dockerfile
dokku postgres:link rhub2 rhub2-shell
```

Create database strcuture, manually from the db/create.sql file.

```
dokku postgres:connect rhub2
```

Mount /uploads, so it is shared between containers.
(E.g. when a new deployment is replacing an old one.)

```
mkdir /uploads
dokku storage:mount rhub2 /uploads:/uploads
```

Update app, first push the shell to dokku. Config first.

```
dokku config:set rhub2 MAILGUN_KEY='<...>'
dokku config:set rhub2 PRIVATE_KEY='<...>'
```

Then locally:

```
git remote add dokku-shell dokku@api.r-pkg.org:rhub2-shell
git push dokku-shell
```

Then add the users and the tokens from the shell, set myself
as admin.

Then push the web app:
```
git remote add dokku dokku@api.r-pkg.org:rhub2
git push dokku
```

Get certs for rhub2.api.r-rpkg.org:

```
dokku domains:report rhub2
dokku letsencrypt:set rhub2 email csardi.gabor@gmail.com
dokku letsencrypt:enable rhub2
```

Test with the rhub package. Everything good, add real domain
and get certs:

```
dokku domains:add rhub2 builder2.rhub.io
dokku letsencrypt:enable rhub2
```

# 2024-04-18

Need to set the max allowed body size to a larger value:
```
dokku nginx:set rhub2  client-max-body-size 20m
```

This is only used for the next deploy, so we might as well
edit the config file directly and then reload nginx:
```
emacs /home/dokku/rhub2/nginx.conf
systemctl reload nginx.service
```
