suite("AnalyserPass", function() {

    var assert;
    var analyserPass;

    setup(function (done) {
        requirejs(['assert', 'model/analyser/passes/analyserpass'], function(Assert, AnalyserPass) {
            console.log("Loaded 'AnalyserPass' module.");
            assert = Assert;
            analyserPass = new AnalyserPass();
            done();
        });
    });

    suite('getVariables()', function() {
        test('variables', function() {
            var input = 'x + y + z';
            var expResult = ['x','y', 'z'];
            var result = analyserPass.getVariables(input);
            assert.deepEqual(result, expResult);
        });

        test('functions', function() {
            var input = 'f(x) + y';
            var expResult = ['f','x', 'y'];
            var result = analyserPass.getVariables(input);
            assert.deepEqual(result, expResult);
        });

        test('Vectors', function() {
            var input = '[x:y, a : b, c:d]';
            var expResult = ['y','b', 'd'];
            var result = analyserPass.getVariables(input);
            assert.deepEqual(result, expResult);
        });

        test('Quantifier', function() {
            var input = '\#(i, [1,2,3], i * i, add)';
            var expResult = ['add'];
            var result = analyserPass.getVariables(input);
            assert.deepEqual(result, expResult);
        });

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

        test('Quantifier', function() {
            var input = '\#(i, [1,2,3], i * i, add)';
            var expResult = ['i'];
            var result = analyserPass.getDummies(input);
            assert.deepEqual(result, expResult);
        });
    });
});
