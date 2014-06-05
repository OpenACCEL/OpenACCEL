suite('uipass.js', function() {

    var uiPass;
    var assert;

    setup(function(done) {
        requirejs(['assert', 'model/passes/preprocessor/uipass', "model/analyser"], function(assertModule, UIPass, Analyser) {
            console.log('Loaded \'UIPass\' module.');
            assert = assertModule;
            uiPass = new UIPass();
            analyser = new Analyser();
            done();
        });
    });

    suite('uipass', function() {

        /**
         * Tests UIPass.parse() with slider
         */
        test('translate x = slider(50,0,100)', function() {
            var actual = uiPass.parse(['x = slider(50,0,100)'], {});
            var expected = ['x = exe.x[0]'];
            assert.deepEqual(actual, expected);
        });

        /**
         * Tests UIPass.parse() with slider
         */
        test('translate x = check(true)', function() {
            var actual = uiPass.parse(['f(x) = check(true)'], {});
            var expected = ['f(x) = exe.f[0]'];
            assert.deepEqual(actual, expected);
        });

        /**
         * Tests UIPass.parse() with slider
         */
        test("translate x = input('something')", function() {
            var actual = uiPass.parse(["x = input('something')"], {});
            var expected = ['x = exe.x[0]'];
            assert.deepEqual(actual, expected);
        });

        /**
         * Tests UIPass.parse() with slider
         */
        test('translate x = button()', function() {
            var actual = uiPass.parse(['f(x) = button()'], {});
            var expected = ['f(x) = exe.f[0]'];
            assert.deepEqual(actual, expected);
        });
    });
});
