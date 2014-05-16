suite('quantitypass.js', function() {
    // quantitypass module.
    var quantitypass;
    var assert;

    setup(function (done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(['assert', 'model/passes/analyser/quantitypass'], function(assertModule, module) {
            console.log('Loaded \'quantitypass\' module.');
            assert = assertModule;
            quantitypass = new module();
            done();
        });
    });

    suite('Quantity Pass', function() {
        test('one single character quantity', function() {
            var input = ['x = 5'];

            var result = quantitypass.analyse(input);

            assert(result.x);
            assert.equal(result.x.name, 'x');
            assert(result.x.parameters.length === 0);
        });

        test('one single character function, one parameter', function() {
            var input = ['f(x) = x'];

            var result = quantitypass.analyse(input);

            assert(result.f);
            assert.equal(result.f.name, 'f');
            assert.deepEqual(result.f.parameters, ['x']);
        });

        test('one single character function, multiple parameters', function() {
            var input = ['f(x,y,z) = x + y + z'];

            var result = quantitypass.analyse(input);

            assert(result.f);
            assert.equal(result.f.name, 'f');
            assert(result.f.parameters.indexOf('x') > -1);
            assert(result.f.parameters.indexOf('y') > -1);
            assert(result.f.parameters.indexOf('z') > -1);
        });

        test('one multi character quantity', function() {
            var input = ['r2d2 = 5'];

            var result = quantitypass.analyse(input);

            assert(result.r2d2);
            assert.equal(result.r2d2.name, 'r2d2');
            assert(result.r2d2.parameters.length === 0);
        });

        test('one multi character function, one parameter', function() {
            var input = ['r2d2(x) = x'];

            var result = quantitypass.analyse(input);

            assert(result.r2d2);
            assert.equal(result.r2d2.name, 'r2d2');
            assert.deepEqual(result.r2d2.parameters, ['x']);
        });

        test('one multi character function, multiple parameters', function() {
            var input = ['r2d2(x,y,z) = x + y + z'];

            var result = quantitypass.analyse(input);

            assert(result.r2d2);
            assert.equal(result.r2d2.name, 'r2d2');
            assert(result.r2d2.parameters.indexOf('x') > -1);
            assert(result.r2d2.parameters.indexOf('y') > -1);
            assert(result.r2d2.parameters.indexOf('z') > -1);
        });

        test('two quantities', function() {
            var input = ['x = 5', 'y = 6'];

            var result = quantitypass.analyse(input);

            assert(result.x);
            assert(result.y);
            assert.equal(result.x.name, 'x');
            assert.equal(result.y.name, 'y');
            assert(result.x.parameters.length === 0);
            assert(result.y.parameters.length === 0);
        });

        test('two functions', function() {
            var input = ['f(x) = x', 'g(x, y) = x + y'];

            var result = quantitypass.analyse(input);

            assert(result.f);
            assert(result.g);
            assert.equal(result.f.name, 'f');
            assert.equal(result.g.name, 'g');
            assert(result.f.parameters.indexOf('x') > -1);
            assert(result.g.parameters.indexOf('x') > -1);
            assert(result.g.parameters.indexOf('y') > -1);
        });

        test('one quantity, one function', function() {
            var input = ['x = 4', 'f(x, y) = x + y'];

            var result = quantitypass.analyse(input);

            assert(result.x);
            assert(result.f);
            assert.equal(result.f.name, 'f');
            assert.equal(result.x.name, 'x');
            assert(result.x.parameters.length === 0);
            assert(result.f.parameters.indexOf('x') > -1);
            assert(result.f.parameters.indexOf('y') > -1);
        });
    });
});