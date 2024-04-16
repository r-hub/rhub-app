FROM rhub/r-minimal

COPY DESCRIPTION /
COPY R /R
WORKDIR /R
RUN installr -d -p \
    -t "postgresql13-dev curl-dev" \
    -a "libcurl postgresql13-client" \
    deps::.

CMD ["crond", "-f"]
