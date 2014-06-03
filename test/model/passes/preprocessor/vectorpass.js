suite("vectorpass.js", function() {

    var assert;
    var vectorPass;

    setup(function(done) {
        requirejs(["assert", "model/passes/preprocessor/vectorpass"], function(Assert, VectorPass) {
            console.log("Loaded 'VectorPass' module.");
            assert = Assert;
            vectorPass = new VectorPass();
            done();
        });
    });

    suite("VectorPass", function() {

        test("parse() robustness", function() {
            assert.throws(
                function() {
                    vectorPass.parse(null);
                });
            assert.throws(
                function() {
                    vectorPass.parse();
                });
        });

        test('parse()', function() {
            var exScript = ['a = [1,2,x:3]', 'y = a.0 + a[x]', 'z = a.1', 'p = a[x]'];

            var resultScript = ['a = [1,2,x:3]', 'y = a[0] + a.x', 'z = a[1]', 'p = a.x']
            assert.deepEqual(vectorPass.parse(exScript, {}), resultScript);
        });

        test('parse() : a = [1, 2, b.0], b = [4, 6, 7]', function() {
            var exScript = ['a = [1, 2, b.0]', 'b = [4, 6, 7]'];
            var resultScript = ['a = [1, 2, b[0]]', 'b = [4, 6, 7]'];
            assert.deepEqual(vectorPass.parse(exScript, {}), resultScript);
        });

        test('parse() : a = [1, 2, b[0]], b = [4, 6, 7]', function() {
            var exScript = ['a = [1, 2, b[0]]', 'b = [4, 6, 7]'];
            var resultScript = ['a = [1, 2, b[0]]', 'b = [4, 6, 7]'];
            assert.deepEqual(vectorPass.parse(exScript, {}), resultScript);
        });

        test('parse() : a = [1 + 10, b[1 + 2], c[x:2, y:3, 5], b[0, 2, y:3, t5: 4, 6, 3, o93e: 0, 5]', function() {
            var exScript = ['a = [1 + 10, b[1 + 2]]', 'c = [x:2, y:3, a.1]', 'b[0, 2, y:3, t5: c.0, 6, 3, o93e: 0, 5]'];
            var resultScript = ['a = [1 + 10, b[1 + 2]]', 'c = [x:2, y:3, a[1]]', 'b[0, 2, y:3, t5: c[0], 6, 3, o93e: 0, 5]'];
            assert.deepEqual(vectorPass.parse(exScript, {}), resultScript);
        });

        /** Test dotToBrackets().
         * Basic transformation
         * y = a.0 == y = a[0]
         */
        test('dotToBrackets() y = a.0', function() {
            assert.equal(vectorPass.dotToBrackets('y = a.0'), 'y = a[0]');
        });

        /** Test dotToBrackets().
         * Basic transformation multiple changes
         * y = a.0 + b.0 == y = a[0] + b[0]
         */
        test('dotToBrackets() y = a.0 + b.0', function() {
            assert.equal(vectorPass.dotToBrackets('y = a.0 + b.0'), 'y = a[0] + b[0]');
        });

        /** Test dotToBrackets().
         * No transformation
         * y = a[0]  == y = a[0]
         */
        test('dotToBrackets() y = a[0]', function() {
            assert.equal(vectorPass.dotToBrackets('y = a[0]'), 'y = a[0]');
        });

        /** Test dotToBrackets().
         * Selective transformation
         * y = a.x + b.0  == y = a.x + b[0]
         */
        test('dotToBrackets() y = a.x + b.0 ', function() {
            assert.equal(vectorPass.dotToBrackets('y = a.x + b.0'), 'y = a.x + b[0]');
        });

        test('dotToBrackets() robustness', function() {
            assert.throws(
                function() {
                    vectorPass.dotToBrackets(null);
                });
            assert.throws(
                function() {
                    vectorPass.dotToBrackets();
                });
        })


        /** Test bracketsToDot().
         * Basic transformation
         * y = a[x] == y = a.x
         */
        test("bracketsToDot() y = a[x]", function() {
            assert.equal(vectorPass.bracketsToDot('y = a[x]'), 'y = a.x');
        });

        /**
         * Simple test for bracketsToDot().
         */
        test("bracketsToDot() y = a[x] + a[b]", function() {
            assert.equal(vectorPass.bracketsToDot('y = a[x] + a[b]'), 'y = a.x + a.b');
        });

        /** Test bracketsToDot().
         * No transformation
         * y = a.x == y = a.x
         */
        test('bracketsToDot() y = a.x', function() {
            assert.equal(vectorPass.bracketsToDot('y = a.x'), 'y = a.x');
        });

        /** Test bracketsToDot().
         * Selective transformation
         * y = a[x] + a.b  == y = a.x + a.b
         */
        test('bracketsToDot() y = a[x] + a.b', function() {
            assert.equal(vectorPass.bracketsToDot('y = a[x] + a.b'), 'y = a.x + a.b');
        });

        /**
         * Robustness tests for bracketsToDot()
         */
        test('bracketsToDot() robustness', function() {
            assert.throws(
                function() {
                    vectorPass.bracketsToDot(null);
                });
            assert.throws(
                function() {
                    vectorPass.bracketsToDot();
                });
        });
    });
});
