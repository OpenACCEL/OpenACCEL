suite("vectorpass.js", function() {
    // Template module.
    var VectorPass;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/passes/preprocessor/vectorpass"], function(assertModule, module) {
            console.log("Loaded 'VectorPass' module.");
            assert = assertModule;
            VectorPass = new module();
            done();
        });
    });

    suite("VectorPass", function() {

        test("parse() robustness", function() {
            assert.throws(
                function() {
                    VectorPass.parse(null);
                });
            assert.throws(
                function() {
                    VectorPass.parse();
                });
        });

        test('parse()', function() {
            var exScript = ['a = [1,2,x:3]', 'y = a.0 + a[x]', 'z = a.1', 'p = a[x]'];

            var resultScript = ['a = [1,2,x:3]', 'y = a[0] + a.x', 'z = a[1]', 'p = a.x']
            assert.deepEqual(VectorPass.parse(exScript, {}), resultScript);
        });

        test('parse() : a = [1, 2, b.0], b = [4, 6, 7]', function() {
            var exScript = ['a = [1, 2, b.0]', 'b = [4, 6, 7]'];
            var resultScript = ['a = [1, 2, b[0]]', 'b = [4, 6, 7]'];
            assert.deepEqual(VectorPass.parse(exScript, {}), resultScript);
        });

        test('parse() : a = [1, 2, b[0]], b = [4, 6, 7]', function() {
            var exScript = ['a = [1, 2, b[0]]', 'b = [4, 6, 7]'];
            var resultScript = ['a = [1, 2, b[0]]', 'b = [4, 6, 7]'];
            assert.deepEqual(VectorPass.parse(exScript, {}), resultScript);
        });

        test('parse() : a = [1 + 10, b[1 + 2], c[x:2, y:3, 5], b[0, 2, y:3, t5: 4, 6, 3, o93e: 0, 5]', function() {
            var exScript = ['a = [1 + 10, b[1 + 2]]', 'c = [x:2, y:3, a.1]', 'b[0, 2, y:3, t5: c.0, 6, 3, o93e: 0, 5]'];
            var resultScript = ['a = [1 + 10, b[1 + 2]]', 'c = [x:2, y:3, a[1]]', 'b[0, 2, y:3, t5: c[0], 6, 3, o93e: 0, 5]'];
            assert.deepEqual(VectorPass.parse(exScript, {}), resultScript);
        });

        /** Test dotToBrackets().
         * Basic transformation
         * y = a.0 == y = a[0]
         */
        test('dotToBrackets() y = a.0', function() {
            assert.equal(VectorPass.dotToBrackets('y = a.0'), 'y = a[0]');
        });

        /** Test dotToBrackets().
         * Basic transformation multiple changes
         * y = a.0 + b.0 == y = a[0] + b[0]
         */
        test('dotToBrackets() y = a.0 + b.0', function() {
            assert.equal(VectorPass.dotToBrackets('y = a.0 + b.0'), 'y = a[0] + b[0]');
        });

        /** Test dotToBrackets().
         * No transformation
         * y = a[0]  == y = a[0]
         */
        test('dotToBrackets() y = a[0]', function() {
            assert.equal(VectorPass.dotToBrackets('y = a[0]'), 'y = a[0]');
        });

        /** Test dotToBrackets().
         * Selective transformation
         * y = a.x + b.0  == y = a.x + b[0]
         */
        test('dotToBrackets() y = a.x + b.0 ', function() {
            assert.equal(VectorPass.dotToBrackets('y = a.x + b.0'), 'y = a.x + b[0]');
        });

        test('dotToBrackets() robustness', function() {
            assert.throws(
                function() {
                    VectorPass.dotToBrackets(null);
                });
            assert.throws(
                function() {
                    VectorPass.dotToBrackets();
                });
        })


        /** Test bracketsToDot().
         * Basic transformation
         * y = a[x] == y = a.x
         */
        test("bracketsToDot() y = a[x]", function() {
            assert.equal(VectorPass.bracketsToDot('y = a[x]'), 'y = a.x');
        });

        /**
         * Simple test for bracketsToDot().
         */
        test("bracketsToDot() y = a[x] + a[b]", function() {
            assert.equal(VectorPass.bracketsToDot('y = a[x] + a[b]'), 'y = a.x + a.b');
        });

        /** Test bracketsToDot().
         * No transformation
         * y = a.x == y = a.x
         */
        test('bracketsToDot() y = a.x', function() {
            assert.equal(VectorPass.bracketsToDot('y = a.x'), 'y = a.x');
        });

        /** Test bracketsToDot().
         * Selective transformation
         * y = a[x] + a.b  == y = a.x + a.b
         */
        test('bracketsToDot() y = a[x] + a.b', function() {
            assert.equal(VectorPass.bracketsToDot('y = a[x] + a.b'), 'y = a.x + a.b');
        });

        /**
         * Robustness tests for bracketsToDot()
         */
        test('bracketsToDot() robustness', function() {
            assert.throws(
                function() {
                    VectorPass.bracketsToDot(null);
                });
            assert.throws(
                function() {
                    VectorPass.bracketsToDot();
                });
        });
    });
});
