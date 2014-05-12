requirejs = require("requirejs");

suite("PreProcessorTest.js", function() {
    // Template module.
    var preprocessor;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "../../../src/model/preprocessor"], function(assertModule, module) {
            console.log("Loaded 'Preprocessor' module.");
            assert = assertModule;
            preprocessor = module;
            done();
        });
    });

    suite("Pre Processor", function() {
        var exScript = "x = 5 \n" +
            "y = sin(x)" +
            "z = 2 + sin(y + sin(x)) + sin(2)" +
            "u = x + y";

        test("scriptToLines()", function() {
            assert.equal(6, preprocessor.scriptToLines());
        });

        /**
         * Test case for translateLine().
         * Line of Accel script with the assignment of a constant value, without unit
         */
        test("translateLine(): constant assignment, no unit", function() {
            var line = "x = 5";
            var expResult = "func(x = 5)";

            assert.equal(expResult, preprocessor.translateLine(line));
        });

        /**
         * Test case for translateLine().
         * Line of Accel script with the assignment of a constant value, with a unit without a power
         */
        test("translateLine(): constant assignment, with unit, no power", function() {
            var line = "x = 5; kg";
            var expResult = "func(x = 5 ; {'kg' : 1})";

            assert.equal(expResult, preprocessor.translateLine(line));
        });

        /**
         * Test case for translateLine().
         * Line of Accel script with the assignment of a constant value, with a unit, with a power
         */
        test("translateLine(): constant assignment, with unit, with power", function() {
            var line = "x = 5; kg2";
            var expResult = "func(x = 5 ; {'kg' : 2})";

            assert.equal(expResult, preprocessor.translateLine(line));
        });

        /**
         * Test case for translateLine().
         * Line of Accel script with references to other variables in the definition.
         */
        test("translateLine(): other variables in definition", function() {
            var line = "u = x + y";
            var expResult = "func(u = exe.x() + exe.y())";

            assert.equal(expResult, preprocessor.translateLine(line));
        });

        /**
         * Test case for translateLine().
         * Line of Accel script with function calls.
         */
        test("translateLine(): other functions in definition", function() {
            var line = "z = 2 + sin(y + sin(x)) + sin(2)";
            var expResult = "func(z = 2 + sin(exe.y() + sin(exe.x())) + sin(2))";

            assert.equal(expResult, preprocessor.translateLine(line));
        });

        /**
         * Test case for translateLine().
         * Checks that an error is thrown for invalit arguments
         */
        test("translateLine(): Errors", function() {
            assert.throws(preprocessor.translateLine(null));
            assert.throws(preprocessor.translateLine());
        });
    });
});