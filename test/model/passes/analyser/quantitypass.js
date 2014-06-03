suite("QunatityPass", function() {
    // quantitypass module.
    var quantitypass;
    var assert;

    setup(function (done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(['assert', 'model/passes/analyser/quantitypass'], function(assertModule, module) {
            console.log("Loaded 'QunatityPass' module.");
            assert = assertModule;
            quantitypass = new module();
            done();
        });
    });

    suite('Quantity Pass', function() {
        test('one single character quantity', function() {
            var input = 'x = 5';
            var quantities = {};

            var result = quantitypass.analyse(input, null, quantities);

            assert('x' in quantities);
            assert.equal(result.name, 'x');
            assert(result.parameters.length === 0);
        });

        test('one single character function, one parameter', function() {
            var input = 'f(x) = x';
            var quantities = {};

            var result = quantitypass.analyse(input, null, quantities);

            assert('f' in quantities);
            assert.equal(result.name, 'f');
            assert.deepEqual(result.parameters, ['x']);
        });

        test('one single character function, multiple parameters', function() {
            var input = 'f(x,y,z) = x + y + z';
            var quantities = {};

            var result = quantitypass.analyse(input, null, quantities);

            assert('f' in quantities);
            assert.equal(result.name, 'f');
            assert(result.parameters.indexOf('x') > -1);
            assert(result.parameters.indexOf('y') > -1);
            assert(result.parameters.indexOf('z') > -1);
        });

        test('one multi character quantity', function() {
            var input = 'r2d2 = 5';
            var quantities = {};

            var result = quantitypass.analyse(input, null, quantities);

            assert('r2d2' in quantities);
            assert.equal(result.name, 'r2d2');
            assert(result.parameters.length === 0);
        });

        test('one multi character function, one parameter', function() {
            var input = 'r2d2(x) = x';
            var quantities = {};

            var result = quantitypass.analyse(input, null, quantities);

            assert('r2d2' in quantities);
            assert.equal(result.name, 'r2d2');
            assert.deepEqual(result.parameters, ['x']);
        });

        test('one multi character function, multiple parameters', function() {
            var input = 'r2d2(x,y,z) = x + y + z';
            var quantities = {};

            var result = quantitypass.analyse(input, null, quantities);

            assert(quantities[result.name]);
            assert.equal(quantities['r2d2'].name, 'r2d2');
            assert(result.parameters.indexOf('x') > -1);
            assert(result.parameters.indexOf('y') > -1);
            assert(result.parameters.indexOf('z') > -1);
        });
    });
});
