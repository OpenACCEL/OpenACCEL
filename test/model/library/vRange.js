suite("vRange Library", function() {
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
            fileLoader.load("vRange", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    suite("vRange", function() {

        /**
         * Test case for vRange.
         * Based on an example of the help documentation
         *
         * input:vRange(['x':1,'y':2])
         * expected: [1,2]
         */
        test("vRange(['x':1,'y':2]) = [1,2]", function() {
            eval(fileLoader.getContent());

            var expected = [1,2];
            var input = [];
            input.x = 1;
            input.y = 2;
            var result =vRange(input);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vRange.
         *
         * input:vRange([1,2,3,4])
         * expected: [1,2,3,4]
         */
        test("vRange([1,2,3,4]) = [1,2,3,4]", function() {
            eval(fileLoader.getContent());

            var expected = [1,2,3,4];
            var input = [1,2,3,4];
            var result =vRange(input);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vRange.
         *
         * input:vRange(['x':0, 1, 'y':2, 3])
         * expected: [1,3,0,2]
         */
        test("vRange(['x':0, 1, 'y':2, 3]) = [1,3,0,2]", function() {
            eval(fileLoader.getContent());

            var expected = [1,3,0,2];
            var input = [];
            input.x = 0;
            input[0] = 1;
            input.y = 2;
            input[1] = 3;
            var result =vRange(input);

            assert.deepEqual(result, expected);
        });

    });
});
