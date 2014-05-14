suite('funcpass.js', function() {
    // Template module.
    var instance;
    var assert;

    setup(function (done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(['assert', 'model/passes/funcpass'], function(assertModule, module) {
            console.log('Loaded \'FuncPass\' module.');
            assert = assertModule;
            instance = new module();
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
            assert.deepEqual(instance.parse(lines), expResult);
        });
    });
});