suite('ifpass.js', function() {
    // Template module.
    var analyser;
    var instance;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(['assert', 'model/passes/preprocessor/ifpass', "model/analyser", "model/script"],
            function(assertModule, module, analyserModule, scriptModule) {
                console.log('Loaded \'IfPass\' module.');
                assert = assertModule;
                instance = new module();
                analyser = new analyserModule();
                Script = scriptModule;
                done();
            });
    });

    suite('IfPass', function() {
        /**
         * Tests whether references to the if function are properly replaced.
         */
        test('IfPass: reference to if function', function() {
            var lines = [
                'x = if(1 == 1, 1, 2)',
                'y = if(sin(0) == 0, if(1 == 1, 2, 3), 4)'
                
            ];
            var expResult = [
                'x = __if__(1 == 1, 1, 2)',
                'y = __if__(sin(0) == 0, __if__(1 == 1, 2, 3), 4)'
            ];
            var script = new Script(lines.join("\n"));
            var report = script.getQuantities();

            assert.deepEqual(instance.parse(lines, report), expResult);
        });

        /**
         * Tests whether other instances of "if" are not replaced
         */
        test('IfPass: reference to if function', function() {
            var lines = [
                'gif(x) = x',
                'y = gif(4) + \'if this is ok\''        
            ];
            
            var script = new Script(lines.join("\n"));
            var report = script.getQuantities();

            assert.deepEqual(instance.parse(lines, report), lines);
        });
    });
});