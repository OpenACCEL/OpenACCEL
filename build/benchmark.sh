#!/bin/bash
#
# Cleaning.
echo "Cleaning any leftover files from previous (intermediate) builds."
rm -rf doc/
rm -rf bin/

# Deployment.
sh build/deploy.sh

# Actual benchmarking using mocha.
echo "Benchmarking..."
mocha test/ -u tdd --recursive --grep @benchmark
