# Deployment.
echo "Deploying all files, such that it is ready for production."
mkdir -p                                                                             bin/scripts
# Copy library files.
cp lib/*                                                                             bin/scripts/
cp node_modules/underscore/underscore-min.js                                         bin/scripts/underscore.js
cp node_modules/jquery/dist/jquery.min.js                                            bin/scripts/jquery.js
cp node_modules/requirejs/require.js                                                 bin/scripts/require.js
cp node_modules/sweet.js/lib/*.js                                                    bin/scripts
cp node_modules/sweet.js/macros/stxcase.js                                           bin/scripts/stxcase.js
cp node_modules/sweet.js/node_modules/escodegen/escodegen.browser.min.js             bin/scripts/escodegen.js
cp node_modules/sweet.js/node_modules/escope/escope.js                               bin/scripts/escope.js
cp node_modules/sweet.js/node_modules/escope/node_modules/estraverse/estraverse.js   bin/scripts/estraverse.js
# Copy scripts.
cp -r src/* bin/scripts
find bin/scripts -type f ! -regex ".*\.s?js" -exec rm {} \;
# Copy images.
cp -r src/view/img bin/img/
# Copy style sheets.
cp -r src/view/css bin/css/

# We are done!
echo "If everything went successful, all files are now in the bin/ directory."
echo "Type 'npm start' to start a local HTTP server and test the program out at 'http://localhost:8080'."
