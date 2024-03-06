FROM rhub/r-minimal

COPY DESCRIPTION /
COPY R /R
WORKDIR /R
RUN installr -d -p \
    -t "postgresql13-dev curl-dev" \
    -a "libcurl postgresql13-client" \
    deps::.

RUN echo "dbpassword" > /db-password

CMD ["crond", "-f"]
