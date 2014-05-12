requirejs = require("requirejs");

suite("PreProcessorTest.js", function() {
    // Template module.
    var preProcessor;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "../../../src/template"], function(assertModule, module) {
            console.log("Loaded 'Template' module.");
            assert = assertModule;
            preprocessor = module;
            done();
        });
    });

    suite("Pre Processor", function() {
        /**
         * Example script to compile.
         * @type {String}
         */
        var exScript = "x = 5 \n" +
            "y = sin(x)\n" +
            "z = 2 + sin(y + sin(x)) + sin(2)\n" +
            "u = x + y";

        /**
         * An array of lines corresponding to {@code exScript}
         * @type {Array[String]}
         */
        var exScriptInLines = ["x = 5",
            "y = sin(x)",
            "z = 2 + sin(y + sin(x)) + sin(2)",
            "u = x + y"
        ];

        /** Robustness test for scriptToLines() */
        test('Robustness scriptToLines()', function() {
            assert.throws(preprocessor.scriptToLines(null));
            assert.throws(preprocessor.scriptToLines(undefined));
        });

        /** Tests the scriptToLines() method. */
        test('scriptToLines()', function() {
            assert.equal(exScriptInLines, preprocessor.scriptToLines(exScript));
        });
    });
});