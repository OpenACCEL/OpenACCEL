suite('uipass.js', function() {
    // Template module.
    var instance;
    var assert;
    var Script;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(['assert', 'model/passes/preprocessor/uipass', "model/analyser", "model/script"],
            function(assertModule, module, analyserModule, scriptModule) {
                console.log('Loaded \'UIPass\' module.');
                assert = assertModule;
                instance = new module();
                analyser = new analyserModule();
                Script = scriptModule;
                done();
            });
    });

    suite('uipass', function() {

        /**
         * Tests UIPass.parse() with slider
         */
        test('translate x = slider(50,0,100)', function() {
            var actual = instance.parse(['x = slider(50,0,100)'], {});
            var expected = ['x = exe.x[0]'];
            assert.deepEqual(actual, expected);
        });

        /**
         * Tests UIPass.parse() with slider
         */
        test('translate x = check(true)', function() {
            var actual = instance.parse(['f(x) = check(true)'], {});
            var expected = ['f(x) = exe.f[0]'];
            assert.deepEqual(actual, expected);
        });

        /**
         * Tests UIPass.parse() with slider
         */
        test("translate x = input('something')", function() {
            var actual = instance.parse(["x = input('something')"], {});
            var expected = ['x = exe.x[0]'];
            assert.deepEqual(actual, expected);
        });

        /**
         * Tests UIPass.parse() with slider
         */
        test('translate x = button()', function() {
            var actual = instance.parse(['f(x) = button()'], {});
            var expected = ['f(x) = exe.f[0]'];
            assert.deepEqual(actual, expected);
        });
    });
});