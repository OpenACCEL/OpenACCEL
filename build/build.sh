#!/bin/bash

# Build
build() {
    clean
    jade
    documentation
    deploy
    post_deploy
}

# Quickbuild
quickbuild() {
    clean
    jade
    deploy
    post_deploy
}

# Testing.
test() {
    clean
    jade
    deploy
    post_deploy
    echo "Testing..."
    case "$1" in
        "") node_modules/.bin/mocha test/ -R list -u tdd --recursive --grep @benchmark --invert ;;
        *)  file=$(find test/ -name "$1".js)
            node_modules/.bin/mocha $file -R list -u tdd -r test/require.js --grep @benchmark --invert ;;
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
    # Generate ACCEL compiler using Jison
    echo "Generating ACCEL compiler..."
    node_modules/.bin/jison utils/ACCEL.jison      -o src/model/parser.js     -m amd -p lalr
    node_modules/.bin/jison utils/ACCELUnits.jison -o src/model/unitparser.js -m amd -p lalr

    echo "Deploying..."
    mkdir -p                                                                             bin/scripts/cm

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
    cp -r node_modules/codemirror/*                                                      bin/scripts/cm

    # Copy CodeMirror ACCEL mode file
    mkdir -p bin/scripts/cm/mode/ACCEL
    cp utils/CodeMirror_ACCEL.js   bin/scripts/cm/mode/ACCEL/ACCEL.js

    # Generating monofunc library functions.
    node ./utils/monofuncgenerator.js ./src/model/library

    # Generate single file containing all standard library functions.
    rm -f src/model/library/functions.js
    cat src/model/library/*.js > src/model/library/functions.js

    # Generate single file containing all unit library functions.
    rm -f src/model/library/units/functions.js
    cat src/model/library/units/* > src/model/library/units/functions.js

    # Generate single file containing all macros.
    rm -f src/model/macros/macros.sjs
    cat src/model/macros/* > src/model/macros/macros.sjs

    # Copy scripts.
    cp -r src/* bin/scripts
    find bin/scripts -type f -not -regex ".*\.s?js" -exec rm {} \;
    find bin/scripts/model/library -type f -not -name "functions.js" -exec rm {} \;

    # Copy images.
    cp -r src/view/img bin/img/

    # Copy style sheets.
    cp -r src/view/css bin/css/


}

# Post Deployment
post_deploy() {
    # Set time depency functions in quantitypass.js
    path_functions="src/model/library/functions.js"
    path_quantitypass="bin/scripts/model/analyser/passes/quantitypass.js"
    regex=".isTimeDependent = true;"
    match=$(grep "$regex" "$path_functions")
    funcs=$(echo $match | sed "s@$regex@@g") # remove all occurences of regex from match
    funcs=$(echo $funcs | sed "s/ /\", \"/g") # replace all spaces with ", "
    placeholder="--TIME-DEPENDENCY-PLACEHOLDER--"
    sed -i "s/${placeholder}/${funcs}/g" $path_quantitypass
}

# Ensure each file in 'folders' with a .js extension has a new line at EOF.
# function fixnleof() {
#     local folders=(src/ test/ utils/)

#     for i in ${folders[@]}; do
#         find $i -type d -exec sh -c '(cd {} && for file in *; do if [[ $file == *.js ]] && [ -n "$(tail -c 1 <"$file")" ]; then echo >>"$file"; fi; done)' ';'
#     done
# }

# Read command line options.
set -e
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
