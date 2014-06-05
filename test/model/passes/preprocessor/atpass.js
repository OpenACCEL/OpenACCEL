suite('atpass.js', function() {
    // Template module.
    var analyser;
    var instance;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(['assert', 'model/passes/preprocessor/atpass', "model/analyser", "model/script"],
            function(assertModule, module, analyserModule, scriptModule) {
                console.log('Loaded \'AtPass\' module.');
                assert = assertModule;
                instance = new module();
                analyser = new analyserModule();
                Script = scriptModule;
                done();
            });
    });

    suite('AtPass', function() {
        /**
         * Tests whether references to the @ function are properly replaced.
         */
        test('AtPass: reference to @ function', function() {
            var lines = [
                'x = @(1 == 1, 1, 2)',
                'y = @(sin(0) == 0, @(1 == 1, 2, 3),@(1 == 4, 5, 6))'

            ];
            var expResult = [
                'x = __at__(1 == 1, 1, 2)',
                'y = __at__(sin(0) == 0, __at__(1 == 1, 2, 3),__at__(1 == 4, 5, 6))'
            ];
            var script = new Script(lines.join("\n"));
            var report = script.getQuantities();
            assert.deepEqual(instance.parse(lines, report), expResult);
        });

        /**
         * Tests whether other instances of "@" are not replaced
         */
        test('AtPass: reference to @ function', function() {
            var lines = [
                'g@(x) = x',
                'y = g@(4) + \'if this is ok\''
            ];

            var script = new Script(lines.join("\n"));
            var report = script.getQuantities();

            assert.deepEqual(instance.parse(lines, report), lines);
        });
    });
});
