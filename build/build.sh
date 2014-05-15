#!/bin/bash
#
# Cleaning.
echo "Cleaning any leftover files from previous (intermediate) builds."
rm -rf doc/
rm -rf bin/

# Jade.
echo "Compiling the view using jade."
npm run jade

# Documentation.
echo "Generating documentation."
npm run doc

# Deployment.
sh build/deploy.sh
