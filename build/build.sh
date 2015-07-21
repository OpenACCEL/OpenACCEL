#!/bin/bash

# Build
build() {
    clean
    jade
    documentation
    deploy
    #post_deploy
    #compress
}

# Quickbuild
quickbuild() {
    clean
    jade
    case "$1" in
        "") deploy ;;
        --server) deploy $1 ;;
    esac

    #post_deploy
}

# Testing.
test() {
    quickbuild
    echo "Testing..."
    case "$1" in
        "") node_modules/.bin/mocha test/ -R list -u tdd --no-timeouts --recursive --grep @benchmark --invert ;;
        *)  file=$(find test/ -name "$1".js)
            node_modules/.bin/mocha $file -R list -u tdd --no-timeouts -r test/require.js --grep @benchmark --invert ;;
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
    # Generate ACCEL compiler using Jison.
    echo "Generating ACCEL compiler..."
    node_modules/.bin/jison lang/ACCEL.jison      -o src/Model/Compilation/Parsers/ACCELScriptParser.js     -m amd -p lalr
    node_modules/.bin/jison lang/ACCELUnits.jison -o src/Model/Compilation/Parsers/ACCELUnitParser.js       -m amd -p lalr

    echo "Deploying..."
    # Create required directories and all subdirectories that do not yet exist.
    mkdir -p                                                                             bin/scripts/cm/lib
    mkdir -p                                                                             bin/scripts/cm/mode/ACCEL
    mkdir -p                                                                             bin/scripts/cm/theme
    mkdir -p                                                                             bin/scripts/cm/addon/edit
    mkdir -p                                                                             bin/scripts/lang
    mkdir -p                                                                             bin/css

    # Copy library files.
    cp lib/*                                                                             bin/scripts/
    cp node_modules/lodash/dist/lodash.min.js                                            bin/scripts/lodash.js
    cp node_modules/jquery/dist/jquery.min.js                                            bin/scripts/jquery.js
    cp node_modules/requirejs/require.js                                                 bin/scripts/require.js

    # Copy CodeMirror files.
    cp node_modules/codemirror/lib/codemirror.js                                         bin/scripts/cm/lib/codemirror.js
    cp node_modules/codemirror/addon/edit/matchbrackets.js                               bin/scripts/cm/addon/edit/matchbrackets.js
    cp node_modules/codemirror/lib/codemirror.css                                        bin/css/codemirror.css
    cp lang/CodeMirror_ACCEL.js                                                          bin/scripts/cm/mode/ACCEL/ACCEL.js

    # Generating monofunc library functions.
    # node ./build/monofuncgenerator.js ./src/Model/Library

    # Generate single file containing all standard library functions.
    rm -f src/Model/Library/Functions.js
    cat src/Model/Library/*.js > src/Model/Library/Functions.js

    # Generate single file containing all unit library functions.
    rm -f src/Model/Library/Units/Functions.js
    cat src/Model/Library/Units/* > src/Model/Library/Units/Functions.js

    # Copy scripts.
    cp -r src/* bin/scripts
    #find bin/scripts -type f -not -regex ".*\.s?js" -exec rm {} \;
    #find bin/scripts/Model/Library -type f -not -name "Functions.js" -exec rm {} \;

    # Copy images.
    cp -r src/View/img bin/img/

    # Copy style sheets.
    cp -r src/View/css/ bin/css

    # Copy demo scripts.
    cp -r lang/DemoScripts bin/DemoScripts

    # Copy information database
    cp lang/ACCEL_functions.json                                                         bin/scripts/lang/ACCEL_functions.json
    cp lang/ACCEL_help.json                                                              bin/scripts/lang/ACCEL_help.json

    # Transform jsx files to js
    echo "Compiling JSX files..."
    jsx -x js src/ bin/scripts/

    # Deploy for server: replace fileloader with server one
    case "$1" in
        --server) cp src/Model/ServerFileLoader.js bin/scripts/Model/FileLoader.js; echo "Deployed for server" ;;
    esac
}

# Post Deployment
post_deploy() {
    # Set time dependency functions in quantitypass.js
    path_functions="src/Model/Library/Functions.js"
    path_quantitypass="bin/scripts/Model/Analyser/Passes/QuantityPass.js"
    regex=".isTimeDependent = true;"
    match=$(grep "$regex" "$path_functions")
    funcs=$(echo $match | sed "s@$regex@@g") # remove all occurences of regex from match
    funcs=$(echo $funcs | sed "s/ /\", \"/g") # replace all spaces with ", "
    placeholder="--TIME-DEPENDENCY-PLACEHOLDER--"
    sed -i "s/${placeholder}/${funcs}/g" $path_quantitypass
}

# Uglify and compress all binary output files.
compress() {
    echo "Uglifying / Compressing..."

    # Uglify all javascript.
    find bin/scripts -type f -regex ".*\.js" -exec node_modules/.bin/uglifyjs --screw-ie8 -c -m -o {} {} \;
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
    --quickbuild)   case "$2" in
                        "") quickbuild ; shift ;;
                        --server) quickbuild $2 ; shift ;;
                    esac ;;
    *)              echo "Invalid argument(s)." ; exit 1 ;;
esac
