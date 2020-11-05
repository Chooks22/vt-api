FROM node:14
EXPOSE 2434

COPY . /opt/src/
WORKDIR /opt/src
RUN cp -v .env.sample .env
RUN wget -q https://repo.mongodb.org/apt/debian/dists/stretch/mongodb-org/4.4/main/binary-amd64/mongodb-org-shell_4.4.0_amd64.deb && \
    dpkg -i ./mongodb-org-shell_4.4.0_amd64.deb && \
    npm i

ENTRYPOINT ["./entrypoint.sh"]