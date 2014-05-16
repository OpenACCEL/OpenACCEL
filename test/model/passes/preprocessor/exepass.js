suite('exepass.js', function() {
    // Template module.
    var instance;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(['assert', 'model/passes/preprocessor/exepass'], function(assertModule, module) {
            console.log('Loaded \'ExePass\' module.');
            assert = assertModule;
            instance = new module();
            done();
        });
    });

    suite('ExePass', function() {
        /**
         * Test case for parse()
         */
        test('parse', function() {
            var lines = [
                'x = 5 ; kg', // Constant assignment with unit
                'y = sin(x)', // simple function
                'z = 2 + sin(y + sin(x)) + sin(2)' // complex function
            ];
            var expResult = [
                'x = 5 ; kg',
                'y = sin(exe.x())',
                'z = 2 + sin(exe.y() + sin(exe.x())) + sin(2)'
            ];

            var report = {
                'x': {
                    parameters: []
                },
                'y': {
                    parameters: []
                },
                'z': {
                    parameters: []
                }
            };

            assert.deepEqual(instance.parse(lines, report), expResult);
        });


        /**
         * Test case for translateRHS().
         * Definition with function calls.
         */
        test('translateRHS(): Definition with function calls', function() {
            var line = '2 + sin(y + sin(x)) + sin(2)';
            var expResult = '2 + sin(exe.y() + sin(exe.x())) + sin(2)';

            var report = {
                'x': {
                    parameters: []
                }
            };

            assert.equal(instance.translateRHS(line, "x", report), expResult);
        });

        test('translateRHS(): local function parameter and user defined function', function() {
            var lines = [
                'x(a) = a ; kg', // Constant assignment with unit
                'y = sin(x(4)) + x(3)', // simple function
            ];
            var expResult = [
                'x(a) = a ; kg',
                'y = sin(exe.x(4)) + exe.x(3)',
            ];

            var report = {
                'x': {
                    name: 'x',
                    parameters: ['a']
                },
                'y': {
                    name: 'y',
                    parameters: []
                },
            };

            assert.deepEqual(instance.parse(lines, report), expResult);
        });

        /**
         * Test case for translateLine().
         * Robustness
         */
        test('translateRHS(): Robustness', function() {
            assert.throws(function() {
                instance.translateRHS(null);
            });
            assert.throws(function() {
                instance.translateRHS();
            });
        });
    });
});
