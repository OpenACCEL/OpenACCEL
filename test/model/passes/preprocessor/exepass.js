suite('exepass.js', function() {
    // Template module.
    var analyser;
    var instance;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(['assert', 'model/passes/preprocessor/exepass', "model/analyser"],
                                                            function(assertModule, module, analyserModule) {
            console.log('Loaded \'ExePass\' module.');
            assert = assertModule;
            instance = new module();
            analyser = new analyserModule();
            done();
        });
    });

    suite('ExePass', function() {
        /**
         * Test case for parse()
         */
        test('parse()', function() {
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
            var report = analyser.analyse(lines.join("\n"));

            assert.deepEqual(instance.parse(lines, report), expResult);
        });

        test('parse(): local function parameter and user defined function', function() {
            var lines = [
                'b = 5',
                'x(a) = a ; kg', // Constant assignment with unit
                'y(a) = sin(x(4)) + x(a)) + a + b', // simple function
            ];
            var expResult = [
                'b = 5',
                'x(a) = a ; kg',
                'y(a) = sin(exe.x(4)) + exe.x(a)) + a + exe.b()',
            ];
            var report = analyser.analyse(lines.join("\n"));

            assert.deepEqual(instance.parse(lines, report), expResult);
        });

        /**
         * Test case for translateRHS().
         * Definition with function calls.
         */
        test('translateRHS(): Definition with function calls', function() {
            var line = '2 + sin(y + sin(x)) + sin(2)';
            var expResult = '2 + sin(exe.y() + sin(exe.x())) + sin(2)';
            var report = analyser.analyse("x = " + line);

            assert.equal(instance.translateRHS(line, "x", report), expResult);
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