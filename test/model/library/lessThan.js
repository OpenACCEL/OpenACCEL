suite("LessThan Library", function() {

    var assert;
    var compiler;
    var macros;
    var script;

    setup(function(done) {
        requirejs(["assert", "model/compiler", "model/fileloader", "model/script"], function(Assert, Compiler, FileLoader, Script) {
            assert = Assert;
            compiler = new Compiler();
            fileLoader = new FileLoader();
            fileLoader.load("lessThan", "library");
            fileLoader.load("unaryZip", "library");
            fileLoader.load("binaryZip", "library");
            fileLoader.load("multiaryZip", "library");
            fileLoader.load("zip", "library");
            script = Script;
            done();
        });
    });

    suite("lessThan", function() {

        /**
         * Test case for lessThan.
         *
         * @input lessThan(1,2)
         * @expected true
         */
        test("lessThan function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = 1;
            var y = 2;
            output = lessThan(x, y);
            assert.deepEqual(output, true);
        });

        /**
         * Test case for lessThan.
         *
         * @input lessThan(2,1)
         * @expected false
         */
        test("lessThan function with 2 variables", function() {
            eval(fileLoader.getContent());
            var x = 2;
            var y = 1;
            output = lessThan(x, y);
            assert.deepEqual(output, false);
        });

        /**
         * Test case for lessThan.
         *
         * @input lessThan(3,[2,3,4])
         * @expected [false,false,true]
         */
        test("lessThan function with a constant and an array", function() {
            eval(fileLoader.getContent());
            var x = 3
            var y = [2, 3, 4];
            output = lessThan(x, y);
            assert.deepEqual(output, [false, false, true]);
        });

        /**
         * Test case for lessThan.
         *
         * @input lessThan([1,2,3],[3,2,1])
         * @expected [true,false,false]
         */
        test("lessThan function with 2 array's", function() {
            eval(fileLoader.getContent());
            var x = [1, 2, 3];
            var y = [3, 2, 1];
            output = lessThan(x, y);
            assert.deepEqual(output, [true, false, false]);
        });

        /**
         * Test case for lessThan.
         *
         * @input lessThan([1,2,3],[3,2,[1,4]])
         * @expected [true, false, [false, true]]
         */
        test("lessThan function with an array and a nested array", function() {
            eval(fileLoader.getContent());
            var x = [1, 2, 3];
            var y = [3, 2, [1, 4]];
            output = lessThan(x, y);
            assert.deepEqual(output, [true, false, [false, true]]);
        });

        /**
         * Test case for lessThan.
         *
         * @input lessThan([1, [2, 3], 3],[3, 2, [1, 4]])
         * @expected [true, [false, false], [false, true]]
         */
        test("lessThan function with nested array's", function() {
            eval(fileLoader.getContent());
            var x = [1, [2, 3], 3];
            var y = [3, 2, [1, 4]];
            output = lessThan(x, y);
            assert.deepEqual(output, [true, [false, false],
                [false, true]
            ]);
        });

    });

    suite("expansion", function() {

        /**
         * Test case for expansion of lessThan.
         *
         * @input x = 5
         *        y = lessThan(x,4)
         * @expected y = false
         */
        test("should expand for 'x = 5, y = lessThan(x, 4)'", function() {
            var input = "x = 5\ny = lessThan(x, 4)";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), false);
        });

        /**
         * Test case for expansion of lessThan.
         *
         * @input x = 5
         *        y = lessThan(x,5)
         *        z = lessThan(x, lessThan(4, y))
         * @expected y = false
         *           z = false
         */
        test("should expand for 'x = 5, y = lessThan(x, 5), z = lessThan(x, lessThan(4, y))'", function() {
            var input = "x = 5\ny = lessThan(x, 5) \nz = lessThan(x, lessThan(4, y))";
            var output = compiler.compile(new script(input));
            assert.equal(output.__y__(), false);
            assert.equal(output.__z__(), false);
        });

    });
});
