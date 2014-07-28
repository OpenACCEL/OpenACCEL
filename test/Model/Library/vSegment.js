suite("vSegment Library", function() {
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
            fileLoader.load("vSegment", "library");
            fileLoader.load("objecttoarray", "library");
            done();
        });
    });

    suite("vSegment", function() {

        /**
         * Test case for vSegment.
         *
         * @input:vSegment([1,2,3,4,5],1,2)
         * @expected: [2]
         */
        test("vSegment([1,2,3,4,5],1,2) = [2]", function() {
            eval(fileLoader.getContent());

            var expected = [2];
            var result = vSegment([1, 2, 3, 4, 5], 1, 2);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vSegment.
         *
         * @input:vSegment([1,[2,3,4,5],3,4,5],1,2)
         * @expected: [[2,3,4,5]]
         */
        test("vSegment([1,[2,3,4,5],3,4,5],1,2) = [[2,3,4,5]]", function() {
            eval(fileLoader.getContent());

            var expected = [
                [2, 3, 4, 5]
            ];
            var result = vSegment([1, [2, 3, 4, 5], 3, 4, 5], 1, 2);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vSegment.
         *
         * @input:vSegment([1,2,3],1,0)
         * @expected: []
         */
        test("vSegment([1,2,3],1,0) = []", function() {
            eval(fileLoader.getContent());

            var expected = [];
            var result = vSegment([1, 2, 3], 1, 0);

            assert.deepEqual(result, expected);
        });

        /**
         * Test case for vSegment.
         *
         * @input:vSegment([], 0, 4)
         * @expected: [0, 0, 0, 0]
         */
        test("vSegment([], 0, 4) = [0, 0, 0, 0]", function() {
            eval(fileLoader.getContent());

            var expected = [0, 0, 0, 0];
            var result = vSegment([], 0, 4);

            assert.deepEqual(result, expected);
        });

    });
});
