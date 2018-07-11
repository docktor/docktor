#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

function generate_certs {
    hostname=${HOSTNAME:-localhost}
    openssl req -subj "/CN=$hostname" -x509 -nodes -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365
}

if [[ "${BASH_SOURCE[0]}" = "$0" ]]; then
    certs_dir="/opt/docktor/certs"
    readonly certs_dir
    mkdir -p "$certs_dir"
    if [ -z "$(ls -A $certs_dir)" ]; then
        cd "$certs_dir"
        echo "Generating certs"
        generate_certs
    else
        echo "Certs already exists"
    fi
    echo "Changing $certs_dir owner to docktor"
    chown -R docktor:docktor "$certs_dir"
fi

