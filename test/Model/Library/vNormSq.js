suite("vNormSq Library", function() {
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
            fileLoader.load("vNormSq", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    suite("vNormSq", function() {

        /**
         * Test case for vNormSq.
         *
         * @input:vNormSq([1,2,3,4])
         * @expected: 30
         */
        test("vNormSq([1,2,3,4]) = 30", function() {
            eval(fileLoader.getContent());

            var expected = 30;
            var result = vNormSq([1, 2, 3, 4]);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vNormSq.
         *
         * @input:vNormSq(5)
         * @expected: 25
         */
        test("vNormSq(5) = 25", function() {
            eval(fileLoader.getContent());

            var expected = 25;
            var result = vNormSq(5);

            assert.deepEqual(result, expected);
        });

    });
});
