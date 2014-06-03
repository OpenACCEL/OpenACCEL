suite('exepass.js', function() {

    var analyser;
    var assert;
    var exePass;
    var Script;

    setup(function(done) {
        requirejs(['assert', 'model/passes/preprocessor/exepass', "model/analyser", "model/script"],
                function(Assert, ExePass, Analyser, scriptModule) {
            console.log('Loaded \'ExePass\' module.');
            assert = Assert;
            exePass = new ExePass();
            analyser = new Analyser();
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

            assert.deepEqual(exePass.parse(lines, report), expResult);
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

            assert.deepEqual(exePass.parse(lines, report), expResult);
        });

        /**
         * Test case for translateRHS().
         * Definition with function calls.
         */
        test('translateRHS(): Definition with function calls', function() {
            var line = '2 + sin(y + sin(x)) + sin(2)';
            var expResult = '2 + sin(exe.y() + sin(exe.x())) + sin(2)';

            var script = new Script("z = " + line);
            var report = script.getQuantities();

            assert.equal(exePass.translateRHS(line, "z", report), expResult);
        });

        test('parse(): Vector dot notation test: myVar.myKey', function() {
            var lines = ['x = myVar.myKey'];
            var expResult = ['x = exe.myVar().myKey'];
            var script = new Script(lines.join("\n"));
            var report = script.getQuantities();

            assert.deepEqual(exePass.parse(lines, report), expResult);
        });

        /**
         * Test case for translateLine().
         * Robustness
         */
        test('translateRHS(): Robustness', function() {
            assert.throws(function() {
                exePass.translateRHS(null);
            });
            assert.throws(function() {
                exePass.translateRHS();
            });
        });
    });
});
