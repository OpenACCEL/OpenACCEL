suite("PreProcessorTest.js", function() {
    // Template module.
    var preprocessor;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/preprocessor"], function(assertModule, module) {
            console.log("Loaded 'Preprocessor' module.");
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
        var exScript = 'x = 5\n' +
            'y = sin(x)\n' +
            'z = 2 + sin(y + sin(x)) + sin(2)\n' +
            'u = x + y';

        var exScriptWithTrailingSpaces = 'x = 5 \n' +
            ' y = sin(x)\n' +
            ' z = 2 + sin(y + sin(x)) + sin(2)\n' +
            'u = x + y ';

        /**
         * An array of lines corresponding to {@code exScript}
         * @type {String[]}
         */
        var exScriptInLines = ['x = 5',
            'y = sin(x)',
            'z = 2 + sin(y + sin(x)) + sin(2)',
            'u = x + y'
        ];

        /** Robustness test for scriptToLines() */
        test('Robustness scriptToLines()', function() {
            assert.throws(
                function() {
                    preprocessor.scriptToLines(null);
                });
            assert.throws(
                function() {
                    preprocessor.scriptToLines();
                });
        });

        /** Tests the scriptToLines() method.
         * Basic test.
         */
        test('scriptToLines() basic test', function() {
            assert.deepEqual(exScriptInLines, preprocessor.scriptToLines(exScript));
        });

        /** Tests the scriptToLines() method.
         * Tests whether trailing spaces are handled correctly.
         */
        test('scriptToLines() trim', function() {
            assert.deepEqual(exScriptInLines,
                preprocessor.scriptToLines(exScriptWithTrailingSpaces))
        });

        /**
         * Tests the trimLines() method for robustness.
         */
        test('Robustness trimLines()', function() {
            assert.throws(
                function() {
                    preprocessor.trimLines(null);
                });
            assert.throws(
                function() {
                    preprocessor.trimLines();
                });
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
         * Checks that an error is thrown for invalid arguments
         */
        test("translateLine(): Errors", function() {
            assert.throws(function() {
                preprocessor.translateLine(null);
            });
            assert.throws(function() {
                preprocessor.translateLine();
            });
        });

        /** Test translateUnits().
         * Unit kg squared.
         */
        test('translateUnits() kg2', function() {
            assert.equal('{\'kg\': 2}', preprocessor.translateUnits('kg2'));
        });

        /** Test translateUnits().
         * Unit m/s.
         */
        test('translateUnits() m/s', function() {
            assert.equal('{\'m\': 1 , \'s\' : -1}', preprocessor.translateUnits('m/s'));
        });

        test('translateUnits() robustness', function() {
            assert.throws(function() {
                preprocessor.translateUnits(null);
            });
            assert.throws(function() {
                preprocessor.translateUnits();
            });
        });
        /**
         * Test case for translateRHS().
         * Definition with function calls.
         */
        test("translateRHS():  Definition with function calls", function() {
            var line = "2 + sin(y + sin(x)) + sin(2)";
            var expResult = "2 + sin(exe.y() + sin(exe.x())) + sin(2)";

            assert.equal(expResult, preprocessor.translateRHS(line));
        });

        /**
         * Test case for translateLine().
         * Robustness
         */
        test("translateRHS(): Robustness", function() {
            assert.throws(function() {
                preprocessor.translateRHS(null);
            });
            assert.throws(function() {
                preprocessor.translateRHS();
            });
        });
    });
});