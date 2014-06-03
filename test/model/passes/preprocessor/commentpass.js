suite('commentpass.js', function() {
    // Template module.
    var commentpass;
    var assert;

    setup(function (done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(['assert', 'model/passes/preprocessor/commentpass'], function(assertModule, module) {
            console.log('Loaded \'CommentPass\' module.');
            assert = assertModule;
            commentpass = new module();
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

            var result = commentpass.parse(input, {});
            assert.deepEqual(result, expResult);
        });

        test('Only comments array', function() {
            var input = [
            '// Value x',
            '// sine of x'
            ];

            var expResult = [];

            var result = commentpass.parse(input, {});
            assert.deepEqual(result, expResult);
        });

        test('No comments', function() {
            var input = [
            'x = 4',
            'y = sin(x)',
            ];

            var result = commentpass.parse(input, {});
            assert.deepEqual(result, input);
        });
    });
});
