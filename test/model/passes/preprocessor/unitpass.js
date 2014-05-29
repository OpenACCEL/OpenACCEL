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

    suite("UnitPass.parse", function() {
        test("parse()", function() {
            var input = ['x = 2 ; kg2', 'y = 3 ; m/s', 'z = 3'];
            var expResult = ['x = 2 ; {\'kg\': 2}', 'y = 3 ; {\'m\': 1, \'s\': -1}', 'z = 3'];
            var result = UnitPass.parse(input, {});
            assert.deepEqual(result, expResult);
        });

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
    });

    suite("UnitPass.translateUnits", function() {
        /** 
         * Test translateUnits().
         * Unit kg squared.
         */
        test('kg2', function() {
            assert.deepEqual(UnitPass.translateUnits('kg2'), '{\'kg\': 2}');
        });

        /** 
         * Test translateUnits().
         * Unit m/s.
         */
        test('m/s', function() {
            assert.deepEqual(UnitPass.translateUnits('m/s'), '{\'m\': 1, \'s\': -1}');
        });

        /** 
         * Test translateUnits().
         * Unit 1/s.
         */
        test('1/s', function() {
            assert.deepEqual(UnitPass.translateUnits('1/s'), '{\'s\': -1}');
        });

        /**
         * Test translateUnits().
         * Unit kg10.m/s2.t3
         */
        test('kg10.m/s2.t3', function() {
            assert.deepEqual(UnitPass.translateUnits('kg10.m/s2.t3'), '{\'kg\': 10, \'m\': 1, \'s\': -2, \'t\': -3}');
        });

        /**
         * Test translateUnits().
         * Error: Multiple divisions
         */
        test('Error: Multiple divisions', function() {
            assert.deepEqual(UnitPass.translateUnits('kg/m/s'), '{\'error\': \'uniterror\'}');
        });

        /**
         * Test translateUnits().
         * Error: Error in unitname
         */
        test('Error: Error in unitname', function() {
            assert.deepEqual(UnitPass.translateUnits('k2g/m'), '{\'error\': \'uniterror\'}');
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
    });

    suite("UnitPass.translateUnitProduct", function() {
        /**
         * Test for UnitPass.translateUnitProduct
         * Single unit with positive power.
         */
        test('Unit with positive power.', function() {
            var input = 'm2';
            var expResult = ['\'m\': 2'];
            var result = UnitPass.translateUnitProduct(input, false);
            assert.deepEqual(result, expResult);
        });

        /**
         * Test for UnitPass.translateUnitProduct
         * Two Units with positive power.
         */
        test('Two Units with positive power.', function() {
            var input = 'm2.s3';
            var expResult = ['\'m\': 2', '\'s\': 3'];
            var result = UnitPass.translateUnitProduct(input, false);
            assert.deepEqual(result, expResult);
        });

        /**
         * Test for UnitPass.translateUnitProduct
         * Two Units with negative power.
         */
        test('Two Units with negative power.', function() {
            var input = 'm2.s3';
            var expResult = ['\'m\': -2', '\'s\': -3'];
            var result = UnitPass.translateUnitProduct(input, true);
            assert.deepEqual(result, expResult);
        });

        /**
         * Test for UnitPass.translateUnitProduct
         * One unit without power, one with.
         */
        test('One unit without power, one with.', function() {
            var input = 'm.s3';
            var expResult = ['\'m\': 1', '\'s\': 3'];
            var result = UnitPass.translateUnitProduct(input, false);
            assert.deepEqual(result, expResult);
        });

        /**
         * Test for UnitPass.translateUnitProduct
         * One unit without power, one with; negative
         */
        test('One unit without power, one with; negative', function() {
            var input = 'm.s3';
            var expResult = ['\'m\': -1', '\'s\': -3'];
            var result = UnitPass.translateUnitProduct(input, true);
            assert.deepEqual(result, expResult);
        });

        /**
         * Test for UnitPass.translateUnitProduct
         * Long one
         */
        test('Long one', function() {
            var input = 'a.b2.c3.d4.e5';
            var expResult = ['\'a\': 1', '\'b\': 2', '\'c\': 3', '\'d\': 4', '\'e\': 5'];
            var result = UnitPass.translateUnitProduct(input, false);
            assert.deepEqual(result, expResult);
        });

        /**
         * Test for UnitPass.translateUnitProduct
         * Error in a unit
         */
        test('Error in a unit', function() {
            var input = 's2/k.m4';
            var expResult = ['\'error\': \'uniterror\''];
            var result = UnitPass.translateUnitProduct(input, false);
            assert.deepEqual(result, expResult);
        });


        /**
         * Test translateUnitProduct()
         * Robustness tests.
         */
        test('translateUnitProduct() robustness', function() {
            assert.throws(function() {
                UnitPass.translateUnitProduct(null);
            });
            assert.throws(function() {
                UnitPass.translateUnitProduct();
            });
        });
    });

    suite("UnitPass.translateSingleUnit", function() {
        /**
         * Test for UnitPass.translateSingleUnit
         * Unit with positive power.
         */
        test('Unit with positive power.', function() {
            var input = 'm2';
            var expResult = '\'m\': 2'
            var result = UnitPass.translateSingleUnit(input, false);
            assert.equal(result, expResult);
        });

        /**
         * Test for UnitPass.translateSingleUnit
         * Unit with negative power.
         */
        test('Unit with negative power.', function() {
            var input = 'm2';
            var expResult = '\'m\': -2'
            var result = UnitPass.translateSingleUnit(input, true);
            assert.equal(result, expResult);
        });

        /**
         * Test for UnitPass.translateSingleUnit
         * Multi-character unit with multi-digit positive power.
         */
        test('Multi-character unit with multi-digit positive power.', function() {
            var input = 'kg10';
            var expResult = '\'kg\': 10'
            var result = UnitPass.translateSingleUnit(input, false);
            assert.equal(result, expResult);
        });

        /**
         * Test for UnitPass.translateSingleUnit
         * Multi-character unit with multi-digit negative power.
         */
        test('Multi-character unit with multi-digit negative power.', function() {
            var input = 'kg10';
            var expResult = '\'kg\': -10'
            var result = UnitPass.translateSingleUnit(input, true);
            assert.equal(result, expResult);
        });

        /**
         * Test for UnitPass.translateSingleUnit
         * Unit with no power; positive
         */
        test('Unit with no power; positive', function() {
            var input = 's';
            var expResult = '\'s\': 1'
            var result = UnitPass.translateSingleUnit(input, false);
            assert.equal(result, expResult);
        });

        /**
         * Test for UnitPass.translateSingleUnit
         * Unit with no power; negative
         */
        test('Unit with no power; negative', function() {
            var input = 's';
            var expResult = '\'s\': -1'
            var result = UnitPass.translateSingleUnit(input, true);
            assert.equal(result, expResult);
        });

        /**
         * Test for UnitPass.translateSingleUnit
         * error: number in unitname
         */
        test('error: number in unitname', function() {
            var input = 's2s';
            var expResult = '\'error\': \'uniterror\'';
            var result = UnitPass.translateSingleUnit(input, true);
            assert.equal(result, expResult);
        });

        /**
         * Test for UnitPass.translateSingleUnit
         * error: non-letter symbol
         */
        test('error: non-letter symbol', function() {
            var input = 's/s';
            var expResult = '\'error\': \'uniterror\'';
            var result = UnitPass.translateSingleUnit(input, true);
            assert.equal(result, expResult);
        });

        /**
         * Test for UnitPass.translateSingleUnit
         * Robustness
         */
        test('robustness', function() {
            assert.throws(function() {
                UnitPass.translateSingleUnit(null);
            });
            assert.throws(function() {
                UnitPass.translateSingleUnit();
            });
        });
    });


});