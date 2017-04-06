#!/bin/bash
set -euo pipefail

# need to set NODE_ENV to dev before grunt build 
# to have file application.min.* (task uglify:production and cssmin:combine)
(export NODE_ENV=development && \
	echo "Updating with NODE_ENV=${NODE_ENV} and user `id`" && \
	cd /opt/docktor/docktor && \
    echo 'Bower install' && \
    bower install && \
    echo 'Building...' && \
    grunt build)
