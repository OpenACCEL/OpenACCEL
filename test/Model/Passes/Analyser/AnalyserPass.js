suite("AnalyserPass", function() {

    var assert;
    var analyserPass;

    setup(function(done) {
        requirejs(['assert', 'Model/Analyser/Passes/AnalyserPass'], function(Assert, AnalyserPass) {
            assert = Assert;
            analyserPass = new AnalyserPass();
            done();
        });
    });

    suite('getVariables()', function() {

        /**
         * Test case for getVariables().
         *
         * @input x + y + z
         * @expected [x, y, z]
         */
        test('variables', function() {
            var input = 'x + y + z';
            var expResult = ['x', 'y', 'z'];
            var result = analyserPass.getVariables(input);
            assert.deepEqual(result, expResult);
        });

        /**
         * Test case for getVariables().
         *
         * @input f(x) + y
         * @expected [f, x, y]
         */
        test('functions', function() {
            var input = 'f(x) + y';
            var expResult = ['f', 'x', 'y'];
            var result = analyserPass.getVariables(input);
            assert.deepEqual(result, expResult);
        });

        /**
         * Test case for getVariables().
         *
         * @input [x:y, a : b, c:d]
         * @expected ['y','b', 'd']
         */
        test('Vectors', function() {
            var input = '[x:y, a : b, c:d]';
            var expResult = ['y', 'b', 'd'];
            var result = analyserPass.getVariables(input);
            assert.deepEqual(result, expResult);
        });

        /**
         * Test case for getVariables().
         *
         * @input \#(i, [1,2,3], i * i, add)
         * @expected ['add']
         */
        test('Quantifier', function() {
            var input = '\#(i, [1,2,3], i * i, add)';
            var expResult = ['add'];
            var result = analyserPass.getVariables(input);
            assert.deepEqual(result, expResult);
        });

        /**
         * Test case for getVariables().
         *
         * @input 'x + "y + z"'
         * @expected ['x']
         */
        test('Strings should be ignored', function() {
            var input = 'x + "y + z"';
            var expResult = ['x'];
            var result = analyserPass.getVariables(input);
            assert.deepEqual(result, expResult);
        });
    });

    suite('getDummies()', function() {
        test('variables', function() {
            var input = 'x + y + z';
            var expResult = [];
            var result = analyserPass.getDummies(input);
            assert.deepEqual(result, expResult);
        });

        /**
         * Test case for getVariables().
         *
         * @input \#(i, [1,2,3], i * i, add)
         * @expected ['i']
         */
        test('Quantifier', function() {
            var input = '\#(i, [1,2,3], i * i, add)';
            var expResult = ['i'];
            var result = analyserPass.getDummies(input);
            assert.deepEqual(result, expResult);
        });
    });
});
