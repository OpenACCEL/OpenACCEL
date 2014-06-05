suite("StringReplacer", function() {

    var assert;
    var stringReplacer;
    var SUBSTITUTE;

    setup(function(done) {
        requirejs(["assert", "model/stringreplacer"], function(Assert, StringReplacer, scriptModule) {
            console.log("Loaded 'StringReplacer' module.");
            assert = Assert;
            stringReplacer = new StringReplacer();
            Script = scriptModule;
            SUBSTITUTE = '\u24E2';
            done();
        });
    });

    suite("StringReplacer", function() {

        /**
         * Tests replaceStrings().
         * a = "hello"
         */
        test("replaceStrings simple double quotes", function() {
            var script = ['a = "hello"'];
            var actual = stringReplacer.replaceStrings(script);
            var expected = ['a = ' + SUBSTITUTE + '0'];
            assert.deepEqual(actual, expected);
        });

        /**
         * Tests replaceStrings().
         * a = "hello"
         * b = 'hi'
         */
        test("replaceStrings two statements one double one single quotes", function() {
            var script = ['a = "hello"', 'b = \'hi\''];
            var actual = stringReplacer.replaceStrings(script);
            var expected = ['a = ' + SUBSTITUTE + '0', 'b = ' + SUBSTITUTE + '1'];
            assert.deepEqual(actual, expected);
        });

        /**
         * Tests replaceStrings().
         * a = "hello" + 'world'
         */
        test("replaceStrings one statement hello + world", function() {
            var script = ['a = "hello" + \'world\''];
            var actual = stringReplacer.replaceStrings(script);
            var expected = ['a = ' + SUBSTITUTE + '0 + ' + SUBSTITUTE + '1'];
            assert.deepEqual(actual, expected);
        });

        /**
         * Robustness tests for replaceStrings().
         */
        test('replaceStrings robustness', function() {
            assert.throws(
                function() {
                    stringReplacer.replaceStrings(null);
                });
            assert.throws(
                function() {
                    stringReplacer.replaceStrings();
                });
        });

        /**
         * Tests restoreStrings().
         * a = "hello"
         */
        test("restoreStrings two statements one double one single quotes", function() {
            var script = ['a = ' + SUBSTITUTE + '0'];
            stringReplacer.buffer = ['"hello"'];
            var actual = stringReplacer.restoreStrings(script);
            var expected = ['a = "hello"'];
            assert.deepEqual(actual, expected);
        });

        /**
         * Tests restoreStrings().
         * a = "hello"
         * b = 'hi'
         */
        test("restoreStrings simple double quotes", function() {
            var script = ['a = ' + SUBSTITUTE + '0', 'b = ' + SUBSTITUTE + '1'];
            stringReplacer.buffer = ['"hello"', "'hi'"];
            var actual = stringReplacer.restoreStrings(script);
            var expected = ['a = "hello"', "b = 'hi'"];
            assert.deepEqual(actual, expected);
        });

        /**
         * Tests restoreStrings().
         * a = "hello" + 'world'
         */
        test("restoreStrings one statement hello + world", function() {
            var script = ['a = ' + SUBSTITUTE + '0'];
            stringReplacer.buffer = ['"hello world"'];
            var actual = stringReplacer.restoreStrings(script);
            var expected = ['a = "hello world"'];
            assert.deepEqual(actual, expected);
        });

        /**
         * Robustness tests for restoreStrings().
         */
        test('restoreStrings robustness', function() {
            assert.throws(
                function() {
                    stringReplacer.restoreStrings(null);
                });
            assert.throws(
                function() {
                    stringReplacer.restoreStrings();
                });
        });

        /**
         * Tests replace()
         * a = "hello"
         */
        test('replace() a = "hello" simple double quotes', function() {
            var script = 'a = "hello"';
            var actual = stringReplacer.replace(script);
            var expected = 'a = ' + SUBSTITUTE + '0';
            assert(actual, expected);
        });

        /**
         * Tests replace()
         * a = 'hello'
         */
        test('replace() a = \'hello\' simple single quotes', function() {
            var script = 'a = \'hello\'';
            var actual = stringReplacer.replace(script);
            var expected = 'a = ' + SUBSTITUTE + '0';
            assert(actual, expected);
        });

        /**
         * Robustness tests for replace().
         */
        test('replace() robustness', function() {
            assert.throws(
                function() {
                    stringReplacer.replace(null);
                });
            assert.throws(
                function() {
                    stringReplacer.replace();
                });
        });

        /**
         * Tests restore()
         * a = "hello"
         */
        test('restore() a = "hello" simple double quotes', function() {
            var script = 'a = ' + SUBSTITUTE + '0';
            stringReplacer.buffer = ['"hello"', "'blub'"];
            var actual = stringReplacer.restore(script);
            var expected = 'a = "hello"';
            assert.equal(actual, expected);
        });

        /**
         * Tests restore()
         * a = 'hello'
         */
        test('restore() a = \'hello\' simple single quotes', function() {
            var script = 'a = ' + SUBSTITUTE + '0';
            stringReplacer.buffer = ["'hello'", "'world'"];
            var actual = stringReplacer.restore(script);
            var expected = 'a = \'hello\'';
            assert.equal(actual, expected);
        });

        /**
         * Tests restore()
         * a = 'world'
         */
        test('restore() ', function() {
            var script = 'a = ' + SUBSTITUTE + '1';
            stringReplacer.buffer = ["'hello'", "'world'"];
            stringReplacer.restore(script);
            var actual = stringReplacer.restore(script);
            var expected = 'a = \'world\'';
            assert.equal(actual, expected);
        });

        /**
         * Robustness tests for restore().
         */
        test('restore() robustness', function() {
            assert.throws(
                function() {
                    stringReplacer.restore(null);
                });
            assert.throws(
                function() {
                    stringReplacer.restore();
                });
        });
    });
});
