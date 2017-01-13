FROM mhart/alpine-node:base
LABEL Name=docktor Authors="@gwleclerc,@matcornic,@Thiht"

WORKDIR /opt/docktor

ENV GOPATH="/opt/go/"
ENV DOCKTOR_PATH="${GOPATH}/src/github.com/soprasteria/docktor"
ENV PATH "$PATH:$GOPATH/bin:/opt/yarn/bin"

COPY . "${DOCKTOR_PATH}"

# 1. Install dependencies
# 2. Build docktor
# 3. Delete dependencies and temp files
# Note : Just one layer for this steps to avoid dependencies being commited to different layers,
# resulting in a larger image.
RUN set -ex \
	&& apk add --no-cache --virtual .build-deps \
		bash \
		go \
    git \
    python \
    make \
    g++ \
    curl \
  && curl -sL https://yarnpkg.com/latest.tar.gz -o yarn.tar.gz \
  && tar xvf yarn.tar.gz \
  && mv dist /opt/yarn \
  && go get -v github.com/kardianos/govendor \
  && echo '{ "allow_root": true }' > /root/.bowerrc \
  \
  && cd "${DOCKTOR_PATH}" \
  && govendor sync -v \
  && yarn install \
  && yarn run dist \
  && mv dist/* /opt/docktor \
  \
  && yarn cache clean \
  && rm /opt/docktor/yarn.tar.gz \
  && apk del .build-deps \
  && rm -rf "$GOPATH" \
  && rm -rf /opt/yarn \
  && rm -rf /root && mkdir /root \
  && rm -rf /usr/bin/node

# TODO : add docktor user instead of root
# TODO : add link to mongo
# TODO : create docker-compose with mongo
# TODO : Make Docktor able to handle env variables like DOCKTOR_MONGO_URL for example.

ENTRYPOINT ["./docktor"]
CMD ["serve"]

EXPOSE 8080
