#!/bin/bash
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
echo "Deploying all files, such that it is ready for production."
mkdir                                           bin/scripts
cp lib/*                                        bin/scripts/
cp node_modules/underscore/underscore-min.js    bin/scripts/underscore.js
cp node_modules/jquery/dist/jquery.min.js       bin/scripts/jquery.js
cp node_modules/requirejs/require.js            bin/scripts/require.js

# We are done!
echo "If everything went successful, all files are now in the bin/ directory."
echo "Type 'npm start' to start a local HTTP server and test the program out at 'http://localhost:8080'."
