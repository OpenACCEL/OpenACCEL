suite("vConvolve Library", function() {
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
            fileLoader.load("vConvolve", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    suite("vConvolve", function() {

        /**
         * Test case for vConvolve.
         *
         * @input: vConvolve([1, 2, 3, 2, 1], [-1, 0, 1], 3, 0)
         * @expected: [-2, -1, 1, 2, 0]
         */
        test("vConvolve([1, 2, 3, 2, 1], [-1, 0, 1], 3, 0) = [-2, -1, 1, 2, 0]", function() {
            eval(fileLoader.getContent());

            var expected = [-2, -1, 1, 2, 0];
            var result = vConvolve([1, 2, 3, 2, 1], [-1, 0, 1], 3, 0);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vConvolve.
         *
         * @input: vConvolve([1,2,3,2,1],[-1,0,1],3,1)
         * @expected: [0,1,2,2,0]
         */
        test("vConvolve([1,2,3,2,1],[-1,0,1],3,1) = [0,1,2,2,0]", function() {
            eval(fileLoader.getContent());

            var expected = [0, 1, 2, 2, 0];
            var result = vConvolve([1, 2, 3, 2, 1], [-1, 0, 1], 3, 1);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vConvolve.
         *
         * @input: vConvolve([1,2,3,2,1],[-1,0,1],3,2)
         * @expected: value=[0,0,1,2,0]
         */
        test("vConvolve([1,2,3,2,1],[-1,0,1],3,2) = value=[0,0,1,2,0]", function() {
            eval(fileLoader.getContent());

            var expected = value = [0, 0, 1, 2, 0];
            var result = vConvolve([1, 2, 3, 2, 1], [-1, 0, 1], 3, 2);

            assert.deepEqual(result, expected);
        });

    });
});
