suite("UnitPass.js", function() {
    // Template module.
    var UnitPass;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/passes/preprocessor/unitpass"], function(assertModule, module) {
            console.log("Loaded 'UnitPass' module.");
            assert = assertModule;
            UnitPass = new module();
            done();
        });
    });

    suite("UnitPass", function() {


        test("parse() robustness", function() {
            assert.throws(
                function() {
                    UnitPass.parse(null);
                });
            assert.throws(
                function() {
                    UnitPass.parse();
                });
        });

        /** Test translateUnits().
         * Unit kg squared.
         */
        test('translateUnits() kg2', function() {
            assert.deepEqual(UnitPass.translateUnits('kg2'), '{\'kg\': 2}');
        });

        /** Test translateUnits().
         * Unit m/s.
         */
        test('translateUnits() m/s', function() {
            assert.deepEqual(UnitPass.translateUnits('m/s'), '{\'m\': 1, \'s\': -1}');
        });

        /**
         * Test translateUnits().
         * Unit kg10.m/s2.t3
         */
        test('translateUnits() kg10.m/s2.t3', function() {
            assert.deepEqual(UnitPass.translateUnits('kg10.m/s2.t3'), '{\'kg\': 10, \'m\': 1, \'s\': -2, \'t\': -3}');
        });

        /**
         * Test translateUnits()
         * Robustness tests.
         */
        test('translateUnits() robustness', function() {
            assert.throws(function() {
                UnitPass.translateUnits(null);
            });
            assert.throws(function() {
                UnitPass.translateUnits();
            });
        });

        /**
         * Test splitUnits()
         * Unit kg2.
         */
        test('splitUnitTest() kg2', function() {
            assert.deepEqual(UnitPass.splitUnits('kg2'), ['kg', 2]);
        });

        /**
         * Test splitUnits()
         * Unit m/s.
         */
        test('splitUnitTest() m/s', function() {
            assert.deepEqual(UnitPass.splitUnits('m/s'), ['m', 1, '/', 's', 1]);
        });

        /**
         * Test splitUnits()
         * Unit n42.kg5/j3.
         */
        test('splitUnitTest() n42.kg5/j3', function() {
            assert.deepEqual(UnitPass.splitUnits('n42.kg5/j3'), ['n', 42, '.', 'kg', 5, '/', 'j', 3]);
        });

        /**
         * Test splitUnits()
         * Robustness tests.
         */
        test('splitUnits() robustness', function() {
            assert.throws(function() {
                UnitPass.splitUnits(null);
            });
            assert.throws(function() {
                UnitPass.splitUnits();
            });
        });

        /**
         * Test addDimensionOne()
         * Unit kg/s.
         */
        test('addDimensionOne() kg/s', function() {
            assert.deepEqual(UnitPass.addDimensionOne(['kg', '/', 's']), ['kg', 1, '/', 's', 1]);
        });

        /**
         * Test splitUnits()
         * Robustness tests.
         */
        test('addDimensionOne() robustness', function() {
            assert.throws(function() {
                UnitPass.addDimensionOne(null);
            });
            assert.throws(function() {
                UnitPass.addDimensionOne();
            });
        });
    });
});
