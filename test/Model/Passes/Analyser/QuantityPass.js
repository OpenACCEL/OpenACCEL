suite("QuantityPass", function() {

    var assert;
    var quantityPass;

    setup(function(done) {
        requirejs(['assert', 'Model/Analyser/Passes/QuantityPass'], function(assertModule, QuantityPass) {
            assert = assertModule;
            quantityPass = new QuantityPass();
            done();
        });
    });

    suite('Quantity Pass', function() {
        /**
         * Test case for quantity pass.
         *
         * @input x = 5
         * @expected 'x' in quantities == true &&
         *           result.name == 'x' &&
         *           result.parameters.length == 0
         */
        test('one single character quantity', function() {
            var input = 'x = 5';
            var quantities = {};

            var result = quantityPass.analyse(input, null, quantities);

            assert('x' in quantities);
            assert.equal(result.name, 'x');
            assert(result.parameters.length === 0);
        });

        /**
         * Test case for quantity pass.
         *
         * @input f(x) = x
         * @expected 'f' in quantities == true &&
         *           result.name == 'f' &&
         *           result.parameters == ['x']
         */
        test('one single character function, one parameter', function() {
            var input = 'f(x) = x';
            var quantities = {};

            var result = quantityPass.analyse(input, null, quantities);

            assert('f' in quantities);
            assert.equal(result.name, 'f');
            assert.deepEqual(result.parameters, ['x']);
        });

        /**
         * Test case for quantity pass.
         *
         * @input f(x,y,z) = x + y + z
         * @expected 'f' in quantities &&
         *           result.name = 'f' &&
         *           result.parameters.indexOf('x') > - 1 &&
         *           result.parameters.indexOf('y') > - 1 &&
         *           result.parameters.indexOf('z') > - 1
         */
        test('one single character function, multiple parameters', function() {
            var input = 'f(x,y,z) = x + y + z';
            var quantities = {};

            var result = quantityPass.analyse(input, null, quantities);

            assert('f' in quantities);
            assert.equal(result.name, 'f');
            assert(result.parameters.indexOf('x') > -1);
            assert(result.parameters.indexOf('y') > -1);
            assert(result.parameters.indexOf('z') > -1);
        });

        /**
         * Test case for quantity pass.
         *
         * @input r2d2 = 5
         * @expected 'r2d2' in quantities &&
         *           'r2d2' == result.name &&
         *           result.parameters.length == 0
         */
        test('one multi character quantity', function() {
            var input = 'r2d2 = 5';
            var quantities = {};

            var result = quantityPass.analyse(input, null, quantities);

            assert('r2d2' in quantities);
            assert.equal(result.name, 'r2d2');
            assert(result.parameters.length === 0);
        });

        /**
         * Test case for quantity pass.
         *
         * @input 'r2d2(x) = x'
         * @expected 'r2d2' in quantities &&
         *           'r2d2' == result.name &&
         *           result.parameters == ['x']
         */
        test('one multi character function, one parameter', function() {
            var input = 'r2d2(x) = x';
            var quantities = {};

            var result = quantityPass.analyse(input, null, quantities);

            assert('r2d2' in quantities);
            assert.equal(result.name, 'r2d2');
            assert.deepEqual(result.parameters, ['x']);
        });

        /**
         * Test case for quantity pass.
         *
         * @input r2d2(x,y,z) = x + y + z
         * @expected quantities[result.name] &&
         *           quantitites['r2d2'].name = 'r2d2' &&
         *           result.parameters.indexOf('x') > -1 &&
         *           result.parameters.indexOf('y') > -1 &&
         *           result.parameters.indexOf('z') > -1
         */
        test('one multi character function, multiple parameters', function() {
            var input = 'r2d2(x,y,z) = x + y + z';
            var quantities = {};

            var result = quantityPass.analyse(input, null, quantities);

            assert(quantities[result.name]);
            assert.equal(quantities['r2d2'].name, 'r2d2');
            assert(result.parameters.indexOf('x') > -1);
            assert(result.parameters.indexOf('y') > -1);
            assert(result.parameters.indexOf('z') > -1);
        });
    });
});
