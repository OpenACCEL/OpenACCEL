suite('funcpass.js', function() {

    var assert;
    var funcPass;

    setup(function (done) {
        requirejs(['assert', 'model/passes/preprocessor/funcpass'], function(Assert, FuncPass) {
            console.log('Loaded \'FuncPass\' module.');
            assert = Assert;
            funcPass = new FuncPass();
            done();
        });
    });

    suite('FuncPass', function() {

        /**
         * Test case for parse()
         */
        test('parse', function() {
            var lines = [
                'x = 5 ; {\'kg\' : 1}', // Constant assignment with unit
                'y = sin(exe.x())', // simple function
                'z = 2 + sin(exe.y() + sin(exe.x())) + sin(2)' // complex function
            ];
            var expResult = [
                'func(x = 5 ; {\'kg\' : 1})',
                'func(y = sin(exe.x()))',
                'func(z = 2 + sin(exe.y() + sin(exe.x())) + sin(2))'
            ];
            assert.deepEqual(funcPass.parse(lines, {}), expResult);
        });
    });
});
