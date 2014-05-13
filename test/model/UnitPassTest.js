suite("UnitPass.js", function() {
    // Template module.
    var UnitPass;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/UnitPass"], function(assertModule, module) {
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
            assert.equal(UnitPass.translateUnits('kg2'), '{\'kg\': 2}');
        });

        /** Test translateUnits().
         * Unit m/s.
         */
        test('translateUnits() m/s', function() {
            assert.equal(UnitPass.translateUnits('m/s'), '{\'m\': 1 , \'s\' : -1}');
        });
        test('translateUnits() robustness', function() {
            assert.throws(function() {
                UnitPass.translateUnits(null);
            });
        });

        test('splitUnitTest()', function() {
            assert.deepEqual(UnitPass.splitUnits('kg2'), ['kg', '2']);
        });

        test('splitUnitTest()', function() {
            assert.deepEqual(UnitPass.splitUnits('m/s'), ['m', '/', 's']);
        });
    });
});