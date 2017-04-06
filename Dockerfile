FROM debian:jessie

# Proxy variables, only for build
ARG HTTP_PROXY=http://renn.proxy.corp.sopra:8080/
ARG http_proxy=${HTTP_PROXY}
ARG HTTPS_PROXY=${HTTP_PROXY}
ARG https_proxy=${HTTP_PROXY}
ARG NO_PROXY="localhost,127.0.0.1,*.sopra"
ARG no_proxy=${NO_PROXY}

ENV DEBIAN_FRONTEND noninteractive
ENV DEBCONF_NONINTERACTIVE_SEEN true

COPY supervisord.conf.d/* /etc/supervisor/conf.d/
COPY startup.sh /opt/startup.sh
COPY build.sh /opt/build.sh
COPY generate-certs.sh /opt/docktor/generate-certs.sh

ENV NODE_ENV production

# Get Node.JS & NPM & GIT & config
RUN apt-get -y update && \
  apt-get -y install supervisor nodejs npm git vim && \
  ln -s /usr/bin/nodejs /usr/bin/node && \
  mkdir -p /home/docktor && \
  useradd -d /home/docktor -s /bin/sh docktor && \
  cd /home/docktor && \
  chown -R docktor:docktor . && \
  chmod -R go=u,go-w . && \
  echo 'docktor:docktorpass' | chpasswd && \
  chown -R docktor:docktor /opt/ && \
  chmod +x /opt/startup.sh /opt/build.sh /opt/docktor/generate-certs.sh && \
  npm install -g bower && \
  npm install -g grunt-cli && \
  npm install -g grunt && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

COPY server.js /opt/docktor/docktor/server.js
COPY bower.json /opt/docktor/docktor/bower.json
COPY gruntfile.js /opt/docktor/docktor/gruntfile.js
COPY package.json /opt/docktor/docktor/package.json

COPY .bowerrc /opt/docktor/docktor/.bowerrc
COPY .csslintrc /opt/docktor/docktor/.csslintrc
COPY .jshintrc /opt/docktor/docktor/.jshintrc
COPY .slugignore /opt/docktor/docktor/.slugignore

COPY app /opt/docktor/docktor/app/
COPY config /opt/docktor/docktor/config/
COPY node_modules /opt/docktor/docktor/node_modules/
COPY public /opt/docktor/docktor/public/

USER docktor
USER root

RUN /opt/build.sh

CMD ["/opt/startup.sh"]