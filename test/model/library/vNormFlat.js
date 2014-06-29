suite("vNormFlat Library", function() {
    var compiler;
    var macros;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, module, FileLoader) {
            assert = Assert;
            compiler = new module();
            fileLoader = new FileLoader();
            fileLoader.load("vNormFlat", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    suite("vNormFlat", function() {

        /**
         * Test case for vNormFlat.
         * Based on an example of the help documentation
         *
         * @input:vNormFlat([1,-1,1,-1,1,-1])
         * @expected: 0
         */
        test("vNormFlat([1,-1,1,-1,1,-1]) = 0", function() {
            eval(fileLoader.getContent());

            var expected = 0;
            var result = vNormFlat([1, -1, 1, -1, 1, -1]);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vNormFlat.
         *
         * @input:vNormFlat(42)
         * @expected: 42
         */
        test("vNormFlat(42) = 42", function() {
            eval(fileLoader.getContent());

            var expected = 42;
            var result = vNormFlat(42);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vNormFlat.
         *
         * @input:vNormFlat(['a', 'b', 'c'])
         * @expected: 'abc'
         */
        test("vNormFlat(['a', 'b', 'c']) = 'abc'", function() {
            eval(fileLoader.getContent());

            var expected = 'abc';
            var result = vNormFlat(['a', 'b', 'c']);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vNormFlat.
         *
         * @input:vNormFlat([y:'a', x:'b', 'c'])
         * @expected: 'cba'
         */
        test("vNormFlat([y:'a', x:'b', 'c']) = 'cba'", function() {
            eval(fileLoader.getContent());

            var expected = 'cab';
            var input = [];
            input.y = 'a';
            input.x = 'b';
            input[0] = 'c';
            var result = vNormFlat(input);

            assert.deepEqual(result, expected);
        });
    });
});
