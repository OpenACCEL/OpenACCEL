#!/bin/bash

# Build
build() {
    clean
    jade
    documentation
    deploy
}

# Quickbuild
quickbuild() {
    clean
    jade
    deploy
}

# Testing.
test() {
    clean
    deploy
    echo "Testing..."
    case "$1" in
        "") node_modules/.bin/mocha test/ -u tdd --recursive --grep @benchmark --invert ;;
        *)  file=$(find test/ -name "$1".js)
            node_modules/.bin/mocha $file -u tdd -r test/require.js --grep @benchmark --invert ;;
    esac
}

#Benchmarking.
benchmark() {
    clean
    deploy
    echo "Benchmarking..."
    case "$1" in
        "") node_modules/.bin/mocha test/ -u tdd --recursive --grep @benchmark ;;
        *)  file=$(find test/ -name "$1".js)
            node_modules/.bin/mocha $file -u tdd -r test/require.js --grep @benchmark ;;
    esac

}

# Cleaning.
clean() {
    echo "Cleaning..."
    rm -rf doc/
    rm -rf bin/
}

# Generate jade files.
jade() {
    echo "Generating jade files..."
    npm run jade
}

# Generate documentation.
documentation() {
    echo "Generating documentation..."
    npm run doc
}

# Deployment.
deploy() {
    echo "Deploying..."
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

    # Generating monofunc library functions.
    node ./utils/monofuncgenerator.js ./src/model/library

    # Copy scripts.
    cp -r src/* bin/scripts
    find bin/scripts -type f ! -regex ".*\.s?js" -exec rm {} \;

    # Copy images.
    cp -r src/view/img bin/img/

    # Copy style sheets.
    cp -r src/view/css bin/css/
}

# Read command line options.
case "$1" in
    --build)        build ;;
    --benchmark)    case "$2" in
                        "") benchmark ; shift ;;
                        *)  benchmark $2 ; shift ;;
                    esac ;;
    --test)         case "$2" in
                        "") test ; shift ;;
                        *)  test $2 ; shift ;;
                    esac ;;
    --quickbuild)   quickbuild ;;
    *)              echo "Invalid argument(s)." ; exit 1 ;;
esac
