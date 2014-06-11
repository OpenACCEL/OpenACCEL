suite('pass.js', function() {

    var assert;
    var pass;

    setup(function(done) {
        requirejs(['assert', 'model/analyser/passes/pass'], function(Assert, Pass) {
            console.log('Loaded \'Pass\' module.');
            assert = Assert;
            pass = new Pass();
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
                    pass.parse(null);
                });
            assert.throws(
                function() {
                    pass.parse();
                });
        });

        /**
         * Test for getLHS method
         */
        test('getLHS()', function() {
            assert.equal('x', pass.getLHS(line1));
            assert.equal('y', pass.getLHS(line2));
            assert.equal('z', pass.getLHS(line3));
        });

        /**
         * Test for getRHS method
         */
        test('getRHS()', function() {
            assert.equal('5', pass.getRHS(line1));
            assert.equal('sin(x)', pass.getRHS(line2));
            assert.equal('2 + sin(y + sin(x)) + sin(2)', pass.getRHS(line3));
        });

        /**
         * Test for getUnits method
         */
        test('getUnits()', function() {
            assert.equal('kg', pass.getUnits(line1));
            assert.equal('', pass.getUnits(line2));
            assert.equal('', pass.getUnits(line3));
        });
    });
});
