suite("UnaryZip", function() {

    var assert;
    var fileLoader;
    var macros;

    setup(function(done) {
        requirejs(["assert", "Model/FileLoader"], function(Assert, FileLoader) {
            assert = Assert;
            fileLoader = new FileLoader();
            fileLoader.load("unaryZip", "library");
            done();
        });
    });

    suite("| Standard", function() {

        // simple test function
        function square(x) {
            return x * x;
        }

        /**
         * Test case for unaryZip, scalar.
         *
         * @input unaryZip(5, square)
         * @expected 25
         */
        test("| Scalar", function() {
            eval(fileLoader.getContent());
            var input = 5;
            var expected = 25;
            var output = unaryZip(input, square);
            assert.equal(output, expected);
        });

        /**
         * Test case for unaryZip, unnamed vector.
         *
         * @input unaryZip([2, 3, 4], square)
         * @expected [4, 9, 16]
         */
        test("| Unnamed vector", function() {
            eval(fileLoader.getContent());
            var input = [2, 3, 4];
            var expected = [4, 9, 16];
            var output = unaryZip(input, square);
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for unaryZip, named vector.
         *
         * @input unaryZip([x:2, y:3, z:4], square)
         * @expected [x:4, y:9, z:16]
         */
        test("| Named vector", function() {
            eval(fileLoader.getContent());
            var input = [];
            input.x = 2;
            input.y = 3;
            input.z = 4;
            var expected = [];
            expected.x = 4;
            expected.y = 9;
            expected.z = 16;
            var output = unaryZip(input, square);
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for unaryZip, named + unnamed vector.
         *
         * @input unaryZip([2, 3, z:4], square)
         * @expected [4, 9, z:16]
         */
        test("| Named + unnamed vector", function() {
            eval(fileLoader.getContent());
            var input = [2, 3];
            input.z = 4;
            var expected = [4, 9];
            expected.z = 16;
            var output = unaryZip(input, square);
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for unaryZip, nested vector.
         *
         * @input unaryZip([1, [2, [3, 4], 5], 6, [7, 8]], square)
         * @expected [1, [4, [9, 16], 25], 36, [49, 64]]
         */
        test("| Nested vector", function() {
            eval(fileLoader.getContent());
            var input = [1, [2, [3, 4], 5], 6, [7, 8]];
            var expected = [1, [4, [9, 16], 25], 36, [49, 64]];
            var output = unaryZip(input, square);
            assert.deepEqual(output, expected);
        });

        /**
         * Test case for unaryZip, nested vector.
         *
         * @input unaryZip([2,[x:3, y:4], square)
         * @expected [4, [x:9, y: 16]]
         */
        test("| Nested vector", function() {
            eval(fileLoader.getContent());
            var input = [2];
            input[1] = [];
            input[1].x = 3;
            input[1].y = 4;
            var expected = [4];
            expected[1] = [];
            expected[1].x = 9;
            expected[1].y = 16;
            var output = unaryZip(input, square);
            assert.deepEqual(output, expected);
        });
    });
});
