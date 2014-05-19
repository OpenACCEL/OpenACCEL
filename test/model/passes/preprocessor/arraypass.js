suite("arraypass.js", function() {
    // Template module.
    var ArrayPass;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/passes/preprocessor/arraypass"], function(assertModule, module) {
            console.log("Loaded 'ArrayPass' module.");
            assert = assertModule;
            ArrayPass = new module();
            done();
        });
    });

    suite("ArrayPass", function() {

        test("parse() robustness", function() {
            assert.throws(
                function() {
                    ArrayPass.parse(null);
                });
            assert.throws(
                function() {
                    ArrayPass.parse();
                });
        });

        /** Test dotPass().
         * transform basic array a.0 to a[0]
         */
        test('dotPass() a[0]', function() {
            assert.equal(ArrayPass.dotPass('y = a.0'), 'y = a[0]');
        });



        test('parse()', function() {
            var exScript = ['a = [1,2,x:3]', 'y = a.0 + a[x]', 'z = a.1', 'p = a[x]'];

            var resultScript = ['a = [1,2,x:3]', 'y = a[0] + a.x', 'z = a[1]', 'p = a.x']
            assert.equal(ArrayPass.parse(exScript, {}), resultScript);
        })

        /**
         * Simple test for bracketPass().
         */
        test("bracketPass() y = a[x] + a[b]", function() {
            assert.equal(ArrayPass.bracketPass('y = a[x] + a[b]'), 'y = a.x + a.b');
        });

        /**
         * Robustness tests for bracketPass()
         */
        test('bracketPass() robustness', function() {
            assert.throws(
                function() {
                    ArrayPass.bracketPass(null);
                });
            assert.throws(
                function() {
                    ArrayPass.bracketPass();
                });
        });

    });
});