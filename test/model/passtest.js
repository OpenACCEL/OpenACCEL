suite('pass.js', function() {
    // Template module.
    var instance;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(['assert', 'model/pass'], function(assertModule, module) {
            console.log('Loaded \'pass\' module.');
            assert = assertModule;
            instance = new module();
            done();
        });
    });

    suite('pass', function() {
        // Lines for testing
        var line1 = 'x = 5 ; kg'; // Constant assignment with unit
        var line2 = 'y = sin(x)'; // simple function
        var line3 = 'z = 2 + sin(y + sin(x)) + sin(2)'; // complex function

        /**
         * Test parse method for robustness.
         */
        test('parse() robustness', function() {
            assert.throws(
                function() {
                    instance.parse(null);
                });
            assert.throws(
                function() {
                    instance.parse();
                });
        });

        /**
         * Test for getLHS method
         */
        test('getLHS()', function() {
            assert.equal('x', instance.getLHS(line1));
            assert.equal('y', instance.getLHS(line2));
            assert.equal('z', instance.getLHS(line3));
        });

        /**
         * Test for getRHS method
         */
        test('getRHS()', function() {
            assert.equal('5', instance.getRHS(line1));
            assert.equal('sin(x)', instance.getRHS(line2));
            assert.equal('2 + sin(y + sin(x)) + sin(2)', instance.getRHS(line3));
        });

        /**
         * Test for getUnits method
         */
        test('getUnits()', function() {
            assert.equal('kg', instance.getUnits(line1));
            assert.equal('', instance.getUnits(line2));
            assert.equal('', instance.getUnits(line3));
        });

    });
});