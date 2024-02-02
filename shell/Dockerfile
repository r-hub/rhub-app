
FROM rhub/r-minimal

RUN apk update
RUN apk add postgresql13-dev
RUN installr -d RPostgres
RUN apk add postgresql13-client

RUN echo "dbpassword" > /db-password

COPY R /R
WORKDIR /R

CMD ["crond", "-f"]
