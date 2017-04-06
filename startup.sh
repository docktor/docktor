#!/bin/bash
set -euo pipefail

/opt/docktor/generate-certs.sh
/usr/bin/supervisord -c /etc/supervisor/supervisord.conf