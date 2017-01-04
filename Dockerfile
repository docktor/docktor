FROM debian:jessie
LABEL Name=docktor Authors="@gwleclerc,@matcornic,@Thiht"

# Default to dummy version
# Build this image by passing env variable to build with right version
ENV DOCKTOR_VERSION="0.0.1"

WORKDIR /opt/docktor

# Install docktor binary from released version
RUN apt-get update && apt-get -y install curl unzip && \
    curl -sL "https://github.com/soprasteria/docktor/releases/download/${DOCKTOR_VERSION}/docktor-${DOCKTOR_VERSION}.zip" -o docktor.zip && \
    unzip docktor.zip && rm docktor.zip && chmod +x docktor && \
    pwd && ls -lrt

ENTRYPOINT ["./docktor"]
CMD ["serve", "-e", "prod"]

EXPOSE 8080
