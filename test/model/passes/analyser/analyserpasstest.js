suite('analyserpass.js', function() {
    // analyserpass module.
    var analyserpass;
    var assert;

    setup(function (done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(['assert', 'model/passes/analyser/analyserpass'], function(assertModule, module) {
            console.log('Loaded \'analyserpass\' module.');
            assert = assertModule;
            analyserpass = new module();
            done();
        });
    });

    suite('getVariables()', function() {
        test('variables', function() {
            var input = 'x + y + z';
            var expResult = ['x','y', 'z'];
            var result = analyserpass.getVariables(input);
            assert.deepEqual(result, expResult);
        });

        test('functions', function() {
            var input = 'f(x) + y';
            var expResult = ['f','x', 'y'];
            var result = analyserpass.getVariables(input);
            assert.deepEqual(result, expResult);
        });

        test('Vectors', function() {
            var input = '[x:y, a : b, c:d]';
            var expResult = ['y','b', 'd'];
            var result = analyserpass.getVariables(input);
            assert.deepEqual(result, expResult);
        });

        test('Quantifier', function() {
            var input = '\#(i, [1,2,3], i * i, add)';
            var expResult = ['add'];
            var result = analyserpass.getVariables(input);
            assert.deepEqual(result, expResult);
        });
    });

    suite('getDummies()', function() {
        test('variables', function() {
            var input = 'x + y + z';
            var expResult = [];
            var result = analyserpass.getDummies(input);
            assert.deepEqual(result, expResult);
        });

        test('Quantifier', function() {
            var input = '\#(i, [1,2,3], i * i, add)';
            var expResult = ['i'];
            var result = analyserpass.getDummies(input);
            assert.deepEqual(result, expResult);
        });
    });
});