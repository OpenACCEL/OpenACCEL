suite('commentpass.js', function() {

    var assert;
    var commentPass;

    setup(function (done) {
        requirejs(['assert', 'model/passes/preprocessor/commentpass'], function(Assert, CommentPass) {
            console.log('Loaded \'CommentPass\' module.');
            assert = Assert;
            commentPass = new CommentPass();
            done();
        });
    });

    suite('Parse Method', function() {
        test('Array with comments', function() {
            var input = [
            'x = 4',
            '// Value x',
            'y = sin(x)',
            '// sine of x'
            ];

            var expResult = [
            'x = 4',
            'y = sin(x)'
            ];

            var result = commentPass.parse(input, {});
            assert.deepEqual(result, expResult);
        });

        test('Only comments array', function() {
            var input = [
            '// Value x',
            '// sine of x'
            ];

            var expResult = [];

            var result = commentPass.parse(input, {});
            assert.deepEqual(result, expResult);
        });

        test('No comments', function() {
            var input = [
            'x = 4',
            'y = sin(x)',
            ];

            var result = commentPass.parse(input, {});
            assert.deepEqual(result, input);
        });
    });
});
