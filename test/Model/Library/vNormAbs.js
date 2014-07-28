suite("vNormAbs Library", function() {
    var compiler;
    var macros;
    var assert;

    setup(function(done) {
        // This saves the module for use in tests. You have to use
        // the done callback because this is asynchronous.
        requirejs(["assert", "Model/Compiler", "Model/FileLoader", "Model/Script"], function(Assert, module, FileLoader) {
            assert = Assert;
            compiler = new module();
            fileLoader = new FileLoader();
            fileLoader.load("vNormAbs", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    suite("vNormAbs", function() {

        /**
         * Test case for vNormAbs.
         * Based on an example of the help documentation
         *
         * @input: vNormAbs([1,-1,1,-1,1,-1])
         * @expected: 6
         */
        test("vNormAbs([1,-1,1,-1,1,-1]) = 6", function() {
            eval(fileLoader.getContent());

            var expected = 6;
            var result = vNormAbs([1, -1, 1, -1, 1, -1]);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vNormAbs.
         *
         * @input: vNormAbs([1, -1, x:1, y: -1])
         * @expected: 4
         */
        test("vNormAbs([1, -1, x:1, y: -1]) = 4", function() {
            eval(fileLoader.getContent());

            var expected = 4;
            var input = [1, -1];
            input.x = 1;
            input.y = -1;
            var result = vNormAbs(input);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vNormAbs.
         *
         * @input: vNormAbs(-42)
         * @expected: 42
         */
        test("vNormAbs(-42) = 42", function() {
            eval(fileLoader.getContent());

            var expected = 42;
            var result = vNormAbs(-42);

            assert.deepEqual(result, expected);
        });

    });
});
