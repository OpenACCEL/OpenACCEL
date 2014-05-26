suite('exepass.js', function() {
    // Template module.
    var analyser;
    var instance;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(['assert', 'model/passes/preprocessor/exepass', "model/analyser", "model/script"],
                                                            function(assertModule, module, analyserModule, scriptModule) {
            console.log('Loaded \'ExePass\' module.');
            assert = assertModule;
            instance = new module();
            analyser = new analyserModule();
            Script = scriptModule;
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
            var script = new Script(lines.join("\n"));
            var report = script.getQuantities();

            assert.deepEqual(instance.parse(lines, report), expResult);
        });

        test('parse(): local function parameter and user defined function', function() {
            var lines = [
                'b = 5',
                'x(a) = a ; kg', // Constant assignment with unit
                'y(a) = sin(x(4) + x(a)) + a + b' // simple function
            ];
            var expResult = [
                'b = 5',
                'x(a) = a ; kg',
                'y(a) = sin(exe.x(4) + exe.x(a)) + a + exe.b()'
            ];

            var script = new Script(lines.join("\n"));
            var report = script.getQuantities();

            assert.deepEqual(instance.parse(lines, report), expResult);
        });

        /**
         * Test case for translateRHS().
         * Definition with function calls.
         */
        test('translateRHS(): Definition with function calls', function() {
            var line = '2 + sin(y + sin(x)) + sin(2)';
            var expResult = '2 + sin(exe.y() + sin(exe.x())) + sin(2)';

            var script = new Script("x = " + line);
            var report = script.getQuantities();

            assert.equal(instance.translateRHS(line, "x", report), expResult);
        });

        test('parse(): Vector dot notation test: myVar.myKey', function() {
            var lines = ['x = myVar.myKey'];
            var expResult = ['x = exe.myVar().myKey'];
            var script = new Script(lines.join("\n"));
            var report = script.getQuantities();

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
