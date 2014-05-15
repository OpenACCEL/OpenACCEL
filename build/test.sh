#!/bin/bash
#
# Cleaning.
echo "Cleaning any leftover files from previous (intermediate) builds."
rm -rf doc/
rm -rf bin/

# Deployment.
sh build/deploy.sh

# Actual testing using mocha.
echo "Testing..."
mocha test/ -u tdd --recursive
