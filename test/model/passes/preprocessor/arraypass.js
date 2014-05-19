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

        test('parse()', function() {
            var exScript = ['a = [1,2,x:3]', 'y = a.0 + a[x]', 'z = a.1', 'p = a[x]'];

            var resultScript = ['a = [1,2,x:3]', 'y = a[0] + a.x', 'z = a[1]', 'p = a.x']
            assert.deepEqual(ArrayPass.parse(exScript, {}), resultScript);
        })

        /** Test dotPass().
         * Basic transformation
         * y = a.0 == y = a[0]
         */
        test('dotPass() y = a.0', function() {
            assert.equal(ArrayPass.dotPass('y = a.0'), 'y = a[0]');
        });

        /** Test dotPass().
         * Basic transformation multiple changes
         * y = a.0 + b.0 == y = a[0] + b[0]
         */
        test('dotPass() y = a.0 + b.0', function() {
            assert.equal(ArrayPass.dotPass('y = a.0 + b.0'), 'y = a[0] + b[0]');
        });

        /** Test dotPass().
         * No transformation
         * y = a[0]  == y = a[0]
         */
        test('dotPass() y = a[0]', function() {
            assert.equal(ArrayPass.dotPass('y = a[0]'), 'y = a[0]');
        });

        /** Test dotPass().
         * Selective transformation
         * y = a.x + b.0  == y = a.x + b[0]
         */
        test('dotPass() y = a.x + b.0 ', function() {
            assert.equal(ArrayPass.dotPass('y = a.x + b.0'), 'y = a.x + b[0]');
        });


        /** Test bracketPass().
         * Basic transformation
         * y = a[x] == y = a.x
         */
        test("bracketPass() y = a[x]", function() {
            assert.equal(ArrayPass.bracketPass('y = a[x]'), 'y = a.x');
        });

        /**
         * Simple test for bracketPass().
         */
        test("bracketPass() y = a[x] + a[b]", function() {
            assert.equal(ArrayPass.bracketPass('y = a[x] + a[b]'), 'y = a.x + a.b');
        });

        /** Test bracketPass().
         * No transformation
         * y = a.x == y = a.x
         */
        test('bracketPass() y = a.x', function() {
            assert.equal(ArrayPass.bracketPass('y = a.x'), 'y = a.x');
        });

        /** Test bracketPass().
         * Selective transformation
         * y = a[x] + a.b  == y = a.x + a.b
         */
        test('bracketPass() y = a[x] + a.b', function() {
            assert.equal(ArrayPass.bracketPass('y = a[x] + a.b'), 'y = a.x + a.b');
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