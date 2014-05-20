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

        /** Test dotToBrackets().
         * Basic transformation
         * y = a.0 == y = a[0]
         */
        test('dotToBrackets() y = a.0', function() {
            assert.equal(ArrayPass.dotToBrackets('y = a.0'), 'y = a[0]');
        });

        /** Test dotToBrackets().
         * Basic transformation multiple changes
         * y = a.0 + b.0 == y = a[0] + b[0]
         */
        test('dotToBrackets() y = a.0 + b.0', function() {
            assert.equal(ArrayPass.dotToBrackets('y = a.0 + b.0'), 'y = a[0] + b[0]');
        });

        /** Test dotToBrackets().
         * No transformation
         * y = a[0]  == y = a[0]
         */
        test('dotToBrackets() y = a[0]', function() {
            assert.equal(ArrayPass.dotToBrackets('y = a[0]'), 'y = a[0]');
        });

        /** Test dotToBrackets().
         * Selective transformation
         * y = a.x + b.0  == y = a.x + b[0]
         */
        test('dotToBrackets() y = a.x + b.0 ', function() {
            assert.equal(ArrayPass.dotToBrackets('y = a.x + b.0'), 'y = a.x + b[0]');
        });

        test('dotToBrackets() robustness', function() {
            assert.throws(
                function() {
                    ArrayPass.dotToBrackets(null);
                });
            assert.throws(
                function() {
                    ArrayPass.dotToBrackets();
                });
        })


        /** Test bracketsToDot().
         * Basic transformation
         * y = a[x] == y = a.x
         */
        test("bracketsToDot() y = a[x]", function() {
            assert.equal(ArrayPass.bracketsToDot('y = a[x]'), 'y = a.x');
        });

        /**
         * Simple test for bracketsToDot().
         */
        test("bracketsToDot() y = a[x] + a[b]", function() {
            assert.equal(ArrayPass.bracketsToDot('y = a[x] + a[b]'), 'y = a.x + a.b');
        });

        /** Test bracketsToDot().
         * No transformation
         * y = a.x == y = a.x
         */
        test('bracketsToDot() y = a.x', function() {
            assert.equal(ArrayPass.bracketsToDot('y = a.x'), 'y = a.x');
        });

        /** Test bracketsToDot().
         * Selective transformation
         * y = a[x] + a.b  == y = a.x + a.b
         */
        test('bracketsToDot() y = a[x] + a.b', function() {
            assert.equal(ArrayPass.bracketsToDot('y = a[x] + a.b'), 'y = a.x + a.b');
        });

        /**
         * Robustness tests for bracketsToDot()
         */
        test('bracketsToDot() robustness', function() {
            assert.throws(
                function() {
                    ArrayPass.bracketsToDot(null);
                });
            assert.throws(
                function() {
                    ArrayPass.bracketsToDot();
                });
        });
    });
});